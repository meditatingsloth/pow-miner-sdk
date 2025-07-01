import test from 'ava';
import {
  createConfig,
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from './_setup';

test('it should initialize a config', async (t) => {
  const client = createDefaultSolanaClient();
  const admin = await generateKeyPairSignerWithSol(client);
  const config = await createConfig(client, admin);
  console.log(config);
  t.pass();
});
