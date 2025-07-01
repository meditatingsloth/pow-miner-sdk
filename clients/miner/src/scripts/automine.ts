#!/usr/bin/env node
import {
  fetchConfigFromSeeds,
  fetchMaybeProofFromSeeds,
} from '@pow-miner-sdk/js';
import { Command } from 'commander';
import { lamportsToSol } from 'gill';
import { Miner } from '../index';
import { createDefaultSolanaClient, loadKeypair } from '../utils';

const program = new Command();

program
  .name('automine')
  .description('Automated mining script for the Pow Miner program')
  .version('0.0.0')
  .argument('<keypair-path>', 'Path to the keypair file')
  .option(
    '-d, --target-difficulty <number>',
    'Target difficulty for mining (default: config.minDifficulty)'
  )
  .option(
    '-m, --min-balance <number>',
    'Minimum balance in SOL before stopping (default: 0.005)',
    '0.005'
  )
  .option(
    '-t, --multithreaded <boolean>',
    'Use multithreaded mining (default: false)',
    false
  )
  .option('-r, --rpc-url <url>', 'RPC URL for the Solana network')
  .parse();

async function main() {
  const options = program.opts();
  const keypairPath = program.args[0];
  process.env.RPC_URL = options.rpcUrl;

  if (!keypairPath) {
    console.error('❌ Keypair path is required');
    program.help();
  }

  const client = createDefaultSolanaClient();
  const config = await fetchConfigFromSeeds(client.rpc);
  const targetDifficulty = options.targetDifficulty
    ? parseInt(options.targetDifficulty, 10)
    : config.data.minDifficulty;
  const minBalance = parseFloat(options.minBalance) * 1_000_000_000; // Convert SOL to lamports

  if (isNaN(targetDifficulty) || targetDifficulty <= 0) {
    console.error('❌ Target difficulty must be a positive number');
    process.exit(1);
  }

  if (isNaN(minBalance) || minBalance <= 0) {
    console.error('❌ Minimum balance must be a positive number');
    process.exit(1);
  }

  console.log(
    `🚀 Starting automine with target difficulty: ${targetDifficulty}`
  );
  console.log(`💰 Minimum balance threshold: ${options.minBalance} SOL`);

  const keypairSigner = await loadKeypair(keypairPath);

  const miner = new Miner(
    client,
    keypairSigner,
    targetDifficulty,
    options.multithreaded
  );

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const balance = await client.rpc.getBalance(keypairSigner.address).send();
      console.log('balance: ' + lamportsToSol(balance.value) + ' SOL');
      if (balance.value < minBalance) {
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
