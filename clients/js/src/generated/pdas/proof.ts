/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  getAddressEncoder,
  getProgramDerivedAddress,
  getUtf8Encoder,
  type Address,
  type ProgramDerivedAddress,
} from '@solana/kit';

export type ProofSeeds = {
  user: Address;
};

export async function findProofPda(
  seeds: ProofSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'BGLDbLHXzZEKvZX2PAkvSChWtZYySZ16Drj6NX247AfY' as Address<'BGLDbLHXzZEKvZX2PAkvSChWtZYySZ16Drj6NX247AfY'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('proof'),
      getAddressEncoder().encode(seeds.user),
    ],
  });
}
