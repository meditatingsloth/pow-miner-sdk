// Web Worker for parallel hash mining
import init, { HashMiner } from '@pow-miner-sdk/hash-wasm';
import { readFileSync } from 'fs';
import { parentPort } from 'worker_threads';
import { countTZ } from './findHash.js';

// Re-declare to avoid type errors in worker scope
type WasmResult = {
  found: boolean;
  nonce: bigint;
  lz: number;
  hash: Uint8Array;
};
interface WasmModule {
  createMiner: (challenge: Uint8Array) => HashMiner;
  mineBatch: (
    miner: HashMiner,
    startNonce: bigint,
    batchSize: number,
    target: number
  ) => WasmResult;
}
let wasmModule: WasmModule | null = null;

// Ensure WASM is loaded before processing messages
const wasmReady = (async () => {
  // In Node.js environment, load WASM binary directly
  if (typeof self === 'undefined') {
    try {
      // Get the path to the WASM file using require.resolve
      const wasmPath = require.resolve(
        '@pow-miner-sdk/hash-wasm/dist/hash_wasm_bg.wasm'
      );
      const wasmBinary = readFileSync(wasmPath);
      await init({ module_or_path: wasmBinary });
    } catch (error) {
      console.error('Failed to load WASM in Node.js:', error);
      // Fallback to default initialization
      await init();
    }
  } else {
    // Browser environment - use default initialization
    await init();
  }
})().then(() => {
  wasmModule = {
    createMiner: (challenge: Uint8Array) => new HashMiner(challenge),
    mineBatch: (
      miner: HashMiner,
      startNonce: bigint,
      batchSize: number,
      target: number
    ) => {
      // The Rust function returns a JsValue that we need to parse
      const result = miner.mine_batch(startNonce, batchSize, target);
      return {
        ...result,
        nonce: BigInt(result.nonce), // Ensure nonce is BigInt
      };
    },
  };
});

interface WorkerMessage {
  type: 'start' | 'stop';
  data?: {
    challenge: Uint8Array;
    startNonce: string; // bigint as string
    endNonce: string; // bigint as string
    targetDifficulty: number;
    batchSize?: number;
  };
}

interface WorkerResponse {
  type: 'progress' | 'found' | 'complete' | 'error';
  data?: {
    nonce?: string;
    lz?: number;
    difficulty?: number;
    hash?: number[];
    hashCount?: number;
    target?: number;
    hashes?: number;
    progress?: number;
    bestLZ?: number;
    bestDifficulty?: number;
    currentNonce?: string;
    endNonce?: string;
    error?: string;
  };
}

let isRunning = false;

// Environment-agnostic message handling
const postMessageToMain = (message: WorkerResponse) => {
  if (typeof self !== 'undefined') {
    self.postMessage(message);
  } else if (parentPort) {
    // We are in a Node.js worker_thread and parentPort is available
    parentPort.postMessage(message);
  }
  // If neither condition is met, we're likely in a test environment - do nothing
};

const setupMessageListener = () => {
  const handleMessage = async (message: WorkerMessage) => {
    const { type, data } = message;

    if (type === 'start' && data) {
      isRunning = true;
      await wasmReady; // Wait for WASM to be ready
      await mineHashes(
        new Uint8Array(data.challenge),
        BigInt(data.startNonce),
        BigInt(data.endNonce),
        data.targetDifficulty,
        data.batchSize || 100_000 // Use a larger batch size for WASM
      );
    } else if (type === 'stop') {
      isRunning = false;
    }
  };

  if (typeof self !== 'undefined') {
    self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      void handleMessage(event.data);
    });
  } else if (parentPort) {
    // We are in a Node.js worker_thread and parentPort is available
    parentPort.on('message', (data: WorkerMessage) => {
      void handleMessage(data);
    });
  }
  // If neither condition is met, we're likely in a test environment
};

setupMessageListener();

async function mineHashes(
  challenge: Uint8Array,
  startNonce: bigint,
  endNonce: bigint,
  targetDifficulty: number,
  batchSize: number
): Promise<void> {
  if (!wasmModule) {
    postMessageToMain({
      type: 'error',
      data: { error: 'WASM module not loaded.' },
    });
    return;
  }

  const miner = wasmModule.createMiner(challenge);
  let nonce = startNonce;
  let hashCount = 0;
  let bestLZ = 0;
  let bestDifficulty = 0;
  let nextYield = performance.now() + 50; // Yield every 50ms

  while (nonce < endNonce && isRunning) {
    const remaining = endNonce - nonce;
    const currentBatchSize =
      remaining < batchSize ? Number(remaining) : batchSize;

    if (currentBatchSize <= 0) break;

    const result = wasmModule.mineBatch(
      miner,
      nonce,
      currentBatchSize,
      targetDifficulty
    );

    if (result.found) {
      const tz = countTZ(result.hash);
      const difficulty = result.lz + (tz >> 2);
      postMessageToMain({
        type: 'found',
        data: {
          nonce: result.nonce.toString(),
          lz: result.lz,
          difficulty,
          hash: Array.from(result.hash),
          hashCount: hashCount + Number(result.nonce - nonce) + 1,
          target: targetDifficulty,
        },
      } as WorkerResponse);
      return;
    }

    // Update bests from the batch result
    if (result.lz > bestLZ) bestLZ = result.lz;
    const tz = countTZ(result.hash);
    const difficulty = result.lz + (tz >> 2);
    if (difficulty > bestDifficulty) bestDifficulty = difficulty;

    hashCount += currentBatchSize;
    nonce += BigInt(currentBatchSize);

    // Send progress update
    const now = performance.now();
    if (now >= nextYield) {
      postMessageToMain({
        type: 'progress',
        data: {
          hashes: hashCount,
          progress: Math.min(bestLZ / targetDifficulty, 1),
          bestLZ,
          bestDifficulty,
          currentNonce: nonce.toString(),
        },
      } as WorkerResponse);

      // Yield control briefly
      await new Promise((resolve) => setTimeout(resolve, 0));
      nextYield = now + 50;
    }
  }

  // Completed range without finding solution
  postMessageToMain({
    type: 'complete',
    data: {
      hashCount,
      bestLZ,
      bestDifficulty,
      endNonce: nonce.toString(),
    },
  } as WorkerResponse);
}
