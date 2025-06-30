#!/usr/bin/env node
import { fetchMaybeProofFromSeeds } from '@pow-miner-sdk/js';
import { lamportsToSol } from 'gill';
import { Miner } from '../index';
import { createDefaultSolanaClient, loadKeypair } from '../utils';

async function main() {
  const keypairSigner = await loadKeypair(process.argv[2]!);
  const client = createDefaultSolanaClient();
  const miner = new Miner(client, keypairSigner);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const balance = await client.rpc.getBalance(keypairSigner.address).send();
      console.log('balance: ' + lamportsToSol(balance.value) + ' SOL');
      if (balance.value < 5_000_000) {
        console.log(
          `💰 Balance too low, stopping mining: ${keypairSigner.address} ${lamportsToSol(
            balance.value
          )} SOL`
        );
        await miner.claimRewards();
        break;
      }

      // 1. Check if user has proof account, initialize if needed
      const proofAccount = await fetchMaybeProofFromSeeds(client.rpc, {
        user: keypairSigner.address,
      });

      if (!proofAccount.exists) {
        throw new Error('Proof account not found');
      }

      const { canMine, secondsLeft } = await miner.canMine();
      if (!canMine) {
        console.log(`⏳ Must wait ${secondsLeft} seconds before mining again`);
        await new Promise((resolve) => setTimeout(resolve, secondsLeft * 1000));
      }

      const miningResult = await miner.mine(proofAccount.data);

      if (miningResult.nonce && miningResult.hash) {
        console.log('📤 Submitting hash...');

        const submitResult = await miner.submitHash(
          proofAccount.data.challengeSlot,
          miningResult.nonce,
          miningResult.hash,
          proofAccount.data.totalHashes
        );

        if (submitResult.success) {
          console.log(
            `✅ Hash submitted! Signature: ${submitResult.signature}`
          );
        } else {
          console.error('❌ Hash submission failed:', submitResult.error);
        }
      }
    } catch (error) {
      console.error('💥 Mining process failed:', error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => {
    process.exit(0);
  });
