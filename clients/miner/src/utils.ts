import fs from 'fs';
import {
  address,
  appendTransactionMessageInstructions,
  type Commitment,
  type CompilableTransactionMessage,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  type IInstruction,
  type KeyPairSigner,
  pipe,
  prependTransactionMessageInstruction,
  type Rpc,
  type RpcSubscriptions,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  simulateTransactionFactory,
  type SolanaRpcApi,
  type SolanaRpcSubscriptionsApi,
  type TransactionMessageWithBlockhashLifetime,
  type TransactionSigner,
} from 'gill';
import {
  loadKeypairSignerFromEnvironment,
  loadKeypairSignerFromEnvironmentBase58,
} from 'gill/node';
import {
  getSetComputeUnitLimitInstruction,
  setTransactionMessageComputeUnitPrice,
} from 'gill/programs';

export const BGLD = address('ELteKNpLHiLKUkZDtkS8oUj6MgfjAasaXw7TPAxn9G5K');
export const FEE_RECEIVER_PUBKEY = address(
  'feee2WdJ6EMaYMyrHqaVmG2WX2bMyLMGtaGfYptJ9iu'
);

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

export const signAndSendTransaction = async (
  client: Client,
  transactionMessage: CompilableTransactionMessage &
    TransactionMessageWithBlockhashLifetime,
  commitment: Commitment = 'confirmed'
) => {
  const signedTransaction =
    await signTransactionMessageWithSigners(transactionMessage);
  const signature = getSignatureFromTransaction(signedTransaction);

  const simulateTransaction = simulateTransactionFactory(client);
  const simulation = await simulateTransaction(signedTransaction);
  if (simulation.value.err) {
    console.error(simulation.value.err);
    console.error(simulation.value.logs);
    throw new Error('Simulation failed');
  }

  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment,
  });
  return signature;
};

export const createSignAndSendTx = async (
  client: Client,
  feePayer: TransactionSigner,
  ixs: IInstruction[],
  computeUnitLimit: number = 200_000,
  computeUnitPrice: number = 2_000
) => {
  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const tx = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => setTransactionMessageComputeUnitPrice(computeUnitPrice, tx),
    (tx) => appendTransactionMessageInstructions(ixs, tx)
  );

  prependTransactionMessageInstruction(
    getSetComputeUnitLimitInstruction({
      units: computeUnitLimit,
    }),
    tx
  );

  return await signAndSendTransaction(client, tx);
};

export const createDefaultSolanaClient = (): Client => {
  if (!process.env.RPC_URL) {
    throw new Error('RPC_URL is not set');
  }

  const rpc = createSolanaRpc(process.env.RPC_URL);
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    process.env.RPC_URL.replace('https://', 'wss://')
  );
  return { rpc, rpcSubscriptions };
};

export async function loadKeypair(filePath: string): Promise<KeyPairSigner> {
  process.env.KEYPAIR = fs.readFileSync(filePath, 'utf-8');
  try {
    return await loadKeypairSignerFromEnvironment('KEYPAIR');
  } catch (e) {
    return await loadKeypairSignerFromEnvironmentBase58('KEYPAIR');
  }
}
