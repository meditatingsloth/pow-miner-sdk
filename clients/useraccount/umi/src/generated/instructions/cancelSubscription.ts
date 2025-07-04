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
} from '@metaplex-foundation/umi/serializers';
import { findProgramStatePda } from '../accounts';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  expectPublicKey,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type CancelSubscriptionInstructionAccounts = {
  user?: PublicKey | Pda;
  escrow?: PublicKey | Pda;
  authority?: Signer;
  systemProgram?: PublicKey | Pda;
  programState?: PublicKey | Pda;
};

// Data.
export type CancelSubscriptionInstructionData = { discriminator: Uint8Array };

export type CancelSubscriptionInstructionDataArgs = {};

export function getCancelSubscriptionInstructionDataSerializer(): Serializer<
  CancelSubscriptionInstructionDataArgs,
  CancelSubscriptionInstructionData
> {
  return mapSerializer<
    CancelSubscriptionInstructionDataArgs,
    any,
    CancelSubscriptionInstructionData
  >(
    struct<CancelSubscriptionInstructionData>(
      [['discriminator', bytes({ size: 8 })]],
      { description: 'CancelSubscriptionInstructionData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([60, 139, 189, 242, 191, 208, 143, 18]),
    })
  ) as Serializer<
    CancelSubscriptionInstructionDataArgs,
    CancelSubscriptionInstructionData
  >;
}

// Instruction.
export function cancelSubscription(
  context: Pick<Context, 'eddsa' | 'identity' | 'programs'>,
  input: CancelSubscriptionInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'useraccount',
    'KoNT93eGXFcQJxZQqBvrBLQQCcxEPhKrmZoqFNmxGjk'
  );

  // Accounts.
  const resolvedAccounts = {
    user: { index: 0, isWritable: true as boolean, value: input.user ?? null },
    escrow: {
      index: 1,
      isWritable: true as boolean,
      value: input.escrow ?? null,
    },
    authority: {
      index: 2,
      isWritable: true as boolean,
      value: input.authority ?? null,
    },
    systemProgram: {
      index: 3,
      isWritable: false as boolean,
      value: input.systemProgram ?? null,
    },
    programState: {
      index: 4,
      isWritable: true as boolean,
      value: input.programState ?? null,
    },
  } satisfies ResolvedAccountsWithIndices;

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
  if (!resolvedAccounts.escrow.value) {
    resolvedAccounts.escrow.value = context.eddsa.findPda(programId, [
      bytes().serialize(new Uint8Array([101, 115, 99, 114, 111, 119])),
      publicKeySerializer().serialize(
        expectPublicKey(resolvedAccounts.user.value)
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
  if (!resolvedAccounts.programState.value) {
    resolvedAccounts.programState.value = findProgramStatePda(context);
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
  const data = getCancelSubscriptionInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
