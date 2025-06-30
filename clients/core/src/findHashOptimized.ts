import { keccak_256 } from '@noble/hashes/sha3';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import { Worker } from 'worker_threads';
import { PowComplete, PowStatus } from './findHash.js';

// Re-export types from original
export type { PowComplete, PowInput, PowStatus } from './findHash.js';

type WorkerResponse = {
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
};

export function findHashSIMD(
  input: {
    walletBytes: ReadonlyUint8Array;
    slotBytes: ReadonlyUint8Array;
    adaptiveTarget: number;
    totalHashesBytes: ReadonlyUint8Array;
  },
  onProgress?: (status: PowStatus) => void,
  numWorkers: number = navigator.hardwareConcurrency || 4
): Promise<PowComplete> {
  const { walletBytes, slotBytes, adaptiveTarget, totalHashesBytes } = input;
  const challenge = keccak_256(
    new Uint8Array([...walletBytes, ...slotBytes, ...totalHashesBytes])
  );

  return new Promise((resolve, reject) => {
    const workers: Worker[] = [];
    let globalHashCount = 0;
    let globalBestLZ = 0;
    let globalBestDifficulty = 0;
    let solutionsFound = 0;

    const NONCE_RANGE_PER_WORKER = 2n ** 48n; // A large but not infinite range

    const handleWorkerMessage = (message: WorkerResponse) => {
      const { type, data } = message;
      if (type === 'found' && data?.nonce) {
        solutionsFound++;
        if (solutionsFound > 1) return; // Already found, ignore others

        // Terminate all workers
        workers.forEach((w) => w.terminate());
        workers.length = 0;

        resolve({
          nonce: BigInt(data.nonce),
          lz: data.lz ?? 0,
          difficulty: data.difficulty ?? 0,
          hash: new Uint8Array(data.hash ?? []),
          hashCount: globalHashCount + (data.hashCount || 0),
          target: adaptiveTarget,
        });
      } else if (type === 'progress' && data) {
        if (data.hashes) globalHashCount += data.hashes;
        if (data.bestLZ && data.bestLZ > globalBestLZ)
          globalBestLZ = data.bestLZ;
        if (data.bestDifficulty && data.bestDifficulty > globalBestDifficulty)
          globalBestDifficulty = data.bestDifficulty;

        onProgress?.({
          hashes: globalHashCount,
          progress: Math.min((data.bestLZ ?? 0) / adaptiveTarget, 1),
          bestLZ: globalBestLZ,
          bestDifficulty: globalBestDifficulty,
        });
      } else if (type === 'error' && data) {
        console.error('Worker error:', data.error);
        workers.forEach((w) => w.terminate());
        reject(new Error(data.error || 'A worker encountered an error.'));
      }
    };

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(__dirname + '/hashWorker.js');
      worker.on('message', handleWorkerMessage);
      worker.on('error', (err: Error) => {
        console.error(`Worker ${i} error:`, err);
        reject(err);
      });
      workers.push(worker);

      const startNonce = BigInt(i) * NONCE_RANGE_PER_WORKER;
      const endNonce = startNonce + NONCE_RANGE_PER_WORKER;

      worker.postMessage({
        type: 'start',
        data: {
          challenge,
          startNonce: startNonce.toString(),
          endNonce: endNonce.toString(),
          adaptiveTarget,
        },
      });
    }
  });
}
