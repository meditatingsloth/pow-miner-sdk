import {
  Address,
  Commitment,
  CompilableTransactionMessage,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
  TransactionMessageWithBlockhashLifetime,
  TransactionSigner,
  airdropFactory,
  appendTransactionMessageInstruction,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit';
import { buildCreateTokenTransaction } from 'gill/programs/token';
import { getInitializeConfigInstructionAsync } from '../src';

type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

export const createDefaultSolanaClient = (): Client => {
  const rpc = createSolanaRpc('http://127.0.0.1:8899');
  const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');
  return { rpc, rpcSubscriptions };
};

export const generateKeyPairSignerWithSol = async (
  client: Client,
  putativeLamports: bigint = 1_000_000_000n
) => {
  const signer = await generateKeyPairSigner();
  await airdropFactory(client)({
    recipientAddress: signer.address,
    lamports: lamports(putativeLamports),
    commitment: 'confirmed',
  });
  return signer;
};

export const createDefaultTransaction = async (
  client: Client,
  feePayer: TransactionSigner
) => {
  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();
  return pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
  );
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
  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment,
  });
  return signature;
};

export const getBalance = async (client: Client, address: Address) =>
  (await client.rpc.getBalance(address, { commitment: 'confirmed' }).send())
    .value;

export const createConfig = async (
  client: Client,
  admin: TransactionSigner
): Promise<Address> => {
  const mintKey = await generateKeyPairSigner();

  const createMintTx = await buildCreateTokenTransaction({
    feePayer: admin,
    latestBlockhash: (await client.rpc.getLatestBlockhash().send()).value,
    mint: mintKey,
    metadata: {
      isMutable: true, // if the `updateAuthority` can change this metadata in the future
      name: 'Only Possible On Solana',
      symbol: 'OPOS',
      uri: 'https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/Climate/metadata.json',
    },
  });
  const signedTx = await signTransactionMessageWithSigners(createMintTx);
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory(client);

  const [transaction] = await Promise.all([
    createDefaultTransaction(client, admin),
    sendAndConfirmTransaction(signedTx, { commitment: 'confirmed' }),
  ]);

  const ix = await getInitializeConfigInstructionAsync({
    admin,
    mint: mintKey.address,
    mintAuth: admin.address,
    mintAuthBump: 0,
  });
  await pipe(
    transaction,
    (tx) => appendTransactionMessageInstruction(ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  return admin.address;
};
