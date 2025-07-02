import {
  findHash,
  findHashMultithreaded,
  getClaimInstructionAsync,
  getMineInstructionAsync,
  POW_MINER_PROGRAM_ADDRESS,
  type PowComplete,
  type PowStatus,
  type Proof,
} from '@pow-miner-sdk/js';
import { findUserPda } from '@pow-miner-sdk/useraccount-js';
import cliProgress from 'cli-progress';
import {
  Account,
  getAddressEncoder,
  getProgramDerivedAddress,
  getU64Encoder,
  getUtf8Encoder,
  type KeyPairSigner,
} from 'gill';
import {
  BGLD,
  type Client,
  createSignAndSendTx,
  FEE_RECEIVER_PUBKEY,
} from './utils';

// Add type definition for target difficulty
type TargetDifficulty = number | (() => number);

export class Miner {
  private client: Client;
  private keypairSigner: KeyPairSigner;
  private targetDifficulty: TargetDifficulty;
  private multithreaded: boolean;

  constructor(
    client: Client,
    keypairSigner: KeyPairSigner,
    targetDifficulty: TargetDifficulty = 25,
    multithreaded: boolean = false
  ) {
    this.client = client;
    this.keypairSigner = keypairSigner;
    this.targetDifficulty = targetDifficulty;
    this.multithreaded = multithreaded;
  }

  /**
   * Resolve the target difficulty value
   */
  private resolveTargetDifficulty(): number {
    return typeof this.targetDifficulty === 'function'
      ? this.targetDifficulty()
      : this.targetDifficulty;
  }

  /**
   * Mine for a valid hash
   */
  async mine(
    proofAccount: Proof,
    onProgress?: (status: PowStatus) => void
  ): Promise<PowComplete> {
    console.log('⛏️  Starting mining...');
    console.log('');
    console.log('');

    // Create a nice progress bar
    const progressBar = new cliProgress.SingleBar({
      format:
        '⛏️  Mining |{bar}| {percentage}% | ETA: {eta}s | Hashes: {hashes} | Best: {bestDifficulty}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    progressBar.start(100, 0, {
      hashes: 0,
      bestDifficulty: 0,
    });

    const walletBytes = getAddressEncoder().encode(this.keypairSigner.address);
    const slotBytes = getU64Encoder().encode(proofAccount.challengeSlot);
    const totalHashesBytes = getU64Encoder().encode(proofAccount.totalHashes);

    function _onProgress(status: PowStatus) {
      progressBar.update(status.progress * 100, {
        hashes: status.hashes.toLocaleString(),
        bestDifficulty: status.bestDifficulty.toLocaleString(),
      });
      onProgress?.(status);
    }

    const currentDifficulty = this.resolveTargetDifficulty();

    const miningFunction = this.multithreaded
      ? findHashMultithreaded
      : findHash;
    const miningResult = await miningFunction(
      {
        walletBytes,
        slotBytes,
        targetDifficulty: currentDifficulty,
        totalHashesBytes,
      },
      _onProgress
    );

    progressBar.stop();

    console.log('');
    console.log(`✅ Mining successful!`);
    console.log(`   Difficulty: ${miningResult.difficulty}`);
    console.log(`   Hash count: ${miningResult.hashCount}`);

    return miningResult;
  }

  /**
   * Submit a mined hash to the on-chain program
   */
  async submitHash(
    slot: bigint,
    nonce: bigint,
    hash: Uint8Array,
    totalHashes: bigint
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      const mineIx = await getMineInstructionAsync({
        user: this.keypairSigner,
        userAccount: (
          await findUserPda({
            authority: this.keypairSigner.address,
          })
        )[0],
        feeReceiver: FEE_RECEIVER_PUBKEY,
        slot,
        nonce,
        hash,
        totalHashes,
      });

      const signature = await createSignAndSendTx(
        this.client,
        this.keypairSigner,
        [mineIx],
        20_000
      );

      return {
        success: true,
        signature,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown submission error',
      };
    }
  }

  /**
   * Claim accumulated rewards
   */
  async claimRewards(): Promise<{
    success: boolean;
    signature?: string;
    error?: string;
  }> {
    try {
      const mintAuthorityPda = await getProgramDerivedAddress({
        programAddress: POW_MINER_PROGRAM_ADDRESS,
        seeds: [
          getUtf8Encoder().encode('mint-authority'),
          getAddressEncoder().encode(BGLD),
        ],
      });

      const claimIx = await getClaimInstructionAsync({
        user: this.keypairSigner,
        mint: BGLD,
        feeReceiver: FEE_RECEIVER_PUBKEY,
        mintArg: BGLD,
        mintAuthority: mintAuthorityPda[0],
        mintAuthBump: mintAuthorityPda[1],
      });

      const signature = await createSignAndSendTx(
        this.client,
        this.keypairSigner,
        [claimIx],
        40_000
      );

      console.log('✅ Rewards claimed successfully:', signature);

      return {
        success: true,
        signature,
      };
    } catch (error) {
      console.error('❌ Error claiming rewards:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown claim error',
      };
    }
  }

  /**
   * Check if user can mine (cooldown check)
   */
  async canMine(
    proof: Account<Proof>
  ): Promise<{ canMine: boolean; secondsLeft: number }> {
    const now = Math.floor(Date.now() / 1000);
    // Minimum 2 second wait to account for possible Solana clock discrepancy
    const secondsLeft = Math.max(0, Number(proof.data.nextMineAt) - now) + 2;

    return {
      canMine: secondsLeft <= 0,
      secondsLeft,
    };
  }
}

/**
 * Utility function to verify a hash meets difficulty requirements
 */
export function verifyHashDifficulty(
  hash: Uint8Array,
  requiredDifficulty: number
): boolean {
  let leadingZeros = 0;
  for (let i = 0; i < hash.length; i++) {
    const byte = hash[i];
    if (byte == undefined) {
      throw new Error('Hash is undefined');
    }
    if (byte === 0) {
      leadingZeros += 8;
    } else {
      for (let bit = 7; bit >= 0; bit--) {
        if ((byte >> bit) & 1) {
          return leadingZeros >= requiredDifficulty;
        }
        leadingZeros++;
      }
      break;
    }
  }
  return leadingZeros >= requiredDifficulty;
}
