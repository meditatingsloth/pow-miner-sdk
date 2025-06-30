import { keccak_256 } from '@noble/hashes/sha3';
import { ReadonlyUint8Array } from '@solana/codecs-core';

const LZ_TABLE = new Uint8Array(256);
const TZ_TABLE = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let lz = 0;
  for (let b = 7; b >= 0 && ((i >> b) & 1) === 0; b--) lz++;
  LZ_TABLE[i] = lz;

  let tz = 0;
  for (let b = 0; b < 8 && ((i >> b) & 1) === 0; b++) tz++;
  TZ_TABLE[i] = tz;
}

export function countLZ(h: Uint8Array): number {
  for (let i = 0; i < h.length; i++) {
    const v = h[i];
    if (v !== 0) return i * 8 + LZ_TABLE[v];
  }
  return h.length * 8;
}

export function countTZ(h: Uint8Array): number {
  for (let i = h.length - 1; i >= 0; i--) {
    const v = h[i];
    if (v !== 0) return (h.length - 1 - i) * 8 + TZ_TABLE[v];
  }
  return h.length * 8;
}

export type PowInput = {
  walletBytes: ReadonlyUint8Array;
  slotBytes: ReadonlyUint8Array;
  targetDifficulty: number;
  totalHashesBytes: ReadonlyUint8Array;
};

export type PowStatus = {
  hashes: number;
  progress: number;
  bestLZ: number;
  bestDifficulty: number;
};

export type PowComplete = {
  nonce: bigint;
  lz: number;
  difficulty: number;
  hash: Uint8Array;
  hashCount: number;
  target: number;
};

// --- PREALLOCATED BUFFERS ---
const CHALLENGE_LEN = 32;
const NONCE_LEN = 8;
const CHALLENGE_WITH_NONCE = new Uint8Array(CHALLENGE_LEN + NONCE_LEN);
const NONCE_VIEW = new DataView(
  CHALLENGE_WITH_NONCE.buffer,
  CHALLENGE_LEN,
  NONCE_LEN
);
const DOUBLE_HASH_BUF = new Uint8Array(CHALLENGE_LEN + NONCE_LEN);

export async function findHash(
  input: PowInput,
  onProgress?: (status: PowStatus) => void
): Promise<PowComplete> {
  const { walletBytes, slotBytes, targetDifficulty, totalHashesBytes } = input;

  // Pre-hash challenge
  const challenge = keccak_256(
    new Uint8Array([...walletBytes, ...slotBytes, ...totalHashesBytes])
  );
  CHALLENGE_WITH_NONCE.set(challenge, 0);

  let nonce = 0n;
  let bestLZ = 0;
  let bestDifficulty = 0;
  let hashCount = 0;
  let finalHash!: Uint8Array;
  let nextYield = performance.now() + 32;

  while (bestLZ < targetDifficulty) {
    NONCE_VIEW.setBigUint64(0, nonce, true);

    // keccak(challenge || nonce)
    const first = keccak_256(CHALLENGE_WITH_NONCE);
    DOUBLE_HASH_BUF.set(first, 0);
    DOUBLE_HASH_BUF.set(
      CHALLENGE_WITH_NONCE.subarray(CHALLENGE_LEN),
      CHALLENGE_LEN
    );

    finalHash = keccak_256(DOUBLE_HASH_BUF);

    const lz = countLZ(finalHash);
    const tz = lz + 64 < targetDifficulty ? 0 : countTZ(finalHash);
    const difficulty = lz + (tz >> 2);

    if (lz > bestLZ) bestLZ = lz;
    if (difficulty > bestDifficulty) bestDifficulty = difficulty;

    nonce++;
    hashCount++;

    const now = performance.now();
    if (now >= nextYield) {
      onProgress?.({
        hashes: hashCount,
        progress: Math.min(bestLZ / targetDifficulty, 1),
        bestLZ,
        bestDifficulty,
      } satisfies PowStatus);

      await new Promise((r) => setTimeout(r));
      nextYield = now + 32;
    }
  }

  return {
    nonce: nonce - 1n,
    lz: bestLZ,
    difficulty: bestDifficulty,
    hash: finalHash,
    hashCount,
    target: targetDifficulty,
  } satisfies PowComplete;
}
