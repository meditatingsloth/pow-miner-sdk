/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  bytes,
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
  u32,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectPublicKey,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type CreateTokenPoolInstructionAccounts = {
  user?: PublicKey | Pda;
  tokenPool?: PublicKey | Pda;
  mint: PublicKey | Pda;
  tokenAccount: PublicKey | Pda;
  authority?: Signer;
  systemProgram?: PublicKey | Pda;
  tokenProgram?: PublicKey | Pda;
};

// Data.
export type CreateTokenPoolInstructionData = {
  discriminator: Uint8Array;
  tokenName: Uint8Array;
};

export type CreateTokenPoolInstructionDataArgs = { tokenName: Uint8Array };

export function getCreateTokenPoolInstructionDataSerializer(): Serializer<
  CreateTokenPoolInstructionDataArgs,
  CreateTokenPoolInstructionData
> {
  return mapSerializer<
    CreateTokenPoolInstructionDataArgs,
    any,
    CreateTokenPoolInstructionData
  >(
    struct<CreateTokenPoolInstructionData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['tokenName', bytes({ size: u32() })],
      ],
      { description: 'CreateTokenPoolInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([23, 169, 27, 122, 147, 169, 209, 152]),
    })
  ) as Serializer<
    CreateTokenPoolInstructionDataArgs,
    CreateTokenPoolInstructionData
  >;
}

// Args.
export type CreateTokenPoolInstructionArgs = CreateTokenPoolInstructionDataArgs;

// Instruction.
export function createTokenPool(
  context: Pick<Context, 'eddsa' | 'identity' | 'programs'>,
  input: CreateTokenPoolInstructionAccounts & CreateTokenPoolInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'useraccount',
    'KoNT93eGXFcQJxZQqBvrBLQQCcxEPhKrmZoqFNmxGjk'
  );

  // Accounts.
  const resolvedAccounts = {
    user: { index: 0, isWritable: true as boolean, value: input.user ?? null },
    tokenPool: {
      index: 1,
      isWritable: true as boolean,
      value: input.tokenPool ?? null,
    },
    mint: { index: 2, isWritable: false as boolean, value: input.mint ?? null },
    tokenAccount: {
      index: 3,
      isWritable: false as boolean,
      value: input.tokenAccount ?? null,
    },
    authority: {
      index: 4,
      isWritable: true as boolean,
      value: input.authority ?? null,
    },
    systemProgram: {
      index: 5,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
    tokenProgram: {
      index: 6,
      isWritable: false as boolean,
      value: input.tokenProgram ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

  // Arguments.
  const resolvedArgs: CreateTokenPoolInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
  }
  if (!resolvedAccounts.user.value) {
    resolvedAccounts.user.value = context.eddsa.findPda(programId, [
      bytes().serialize(new Uint8Array([117, 115, 101, 114])),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.authority.value)
      ),
    ]);
  }
  if (!resolvedAccounts.tokenPool.value) {
    resolvedAccounts.tokenPool.value = context.eddsa.findPda(programId, [
      bytes().serialize(
        new Uint8Array([116, 111, 107, 101, 110, 95, 112, 111, 111, 108])
      ),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.user.value)
      ),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.mint.value)
      ),
    ]);
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'systemProgram',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
  }
  if (!resolvedAccounts.tokenProgram.value) {
    resolvedAccounts.tokenProgram.value = context.programs.getPublicKey(
      'tokenProgram',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    );
    resolvedAccounts.tokenProgram.isWritable = false;
  }

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getCreateTokenPoolInstructionDataSerializer().serialize(
    resolvedArgs as CreateTokenPoolInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
