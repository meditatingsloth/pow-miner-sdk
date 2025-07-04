/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  Account,
  Context,
  Pda,
  PublicKey,
  RpcAccount,
  RpcGetAccountOptions,
  RpcGetAccountsOptions,
  assertAccountExists,
  deserializeAccount,
  gpaBuilder,
  publicKey as toPublicKey,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  bytes,
  i64,
  mapSerializer,
  publicKey as publicKeySerializer,
  struct,
  u64,
} from '@metaplex-foundation/umi/serializers';

export type EscrowAccount = Account<EscrowAccountAccountData>;

export type EscrowAccountAccountData = {
  discriminator: Uint8Array;
  owner: PublicKey;
  amount: bigint;
  subscriptionEnd: bigint;
  createdAt: bigint;
  lastUpdated: bigint;
};

export type EscrowAccountAccountDataArgs = {
  owner: PublicKey;
  amount: number | bigint;
  subscriptionEnd: number | bigint;
  createdAt: number | bigint;
  lastUpdated: number | bigint;
};

export function getEscrowAccountAccountDataSerializer(): Serializer<
  EscrowAccountAccountDataArgs,
  EscrowAccountAccountData
> {
  return mapSerializer<
    EscrowAccountAccountDataArgs,
    any,
    EscrowAccountAccountData
  >(
    struct<EscrowAccountAccountData>(
      [
        ['discriminator', bytes({ size: 8 })],
        ['owner', publicKeySerializer()],
        ['amount', u64()],
        ['subscriptionEnd', i64()],
        ['createdAt', i64()],
        ['lastUpdated', i64()],
      ],
      { description: 'EscrowAccountAccountData' }
    ),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([36, 69, 48, 18, 128, 225, 125, 135]),
    })
  ) as Serializer<EscrowAccountAccountDataArgs, EscrowAccountAccountData>;
}

export function deserializeEscrowAccount(
  rawAccount: RpcAccount
): EscrowAccount {
  return deserializeAccount(
    rawAccount,
    getEscrowAccountAccountDataSerializer()
  );
}

export async function fetchEscrowAccount(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<EscrowAccount> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  assertAccountExists(maybeAccount, 'EscrowAccount');
  return deserializeEscrowAccount(maybeAccount);
}

export async function safeFetchEscrowAccount(
  context: Pick<Context, 'rpc'>,
  publicKey: PublicKey | Pda,
  options?: RpcGetAccountOptions
): Promise<EscrowAccount | null> {
  const maybeAccount = await context.rpc.getAccount(
    toPublicKey(publicKey, false),
    options
  );
  return maybeAccount.exists ? deserializeEscrowAccount(maybeAccount) : null;
}

export async function fetchAllEscrowAccount(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<EscrowAccount[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts.map((maybeAccount) => {
    assertAccountExists(maybeAccount, 'EscrowAccount');
    return deserializeEscrowAccount(maybeAccount);
  });
}

export async function safeFetchAllEscrowAccount(
  context: Pick<Context, 'rpc'>,
  publicKeys: Array<PublicKey | Pda>,
  options?: RpcGetAccountsOptions
): Promise<EscrowAccount[]> {
  const maybeAccounts = await context.rpc.getAccounts(
    publicKeys.map((key) => toPublicKey(key, false)),
    options
  );
  return maybeAccounts
    .filter((maybeAccount) => maybeAccount.exists)
    .map((maybeAccount) =>
      deserializeEscrowAccount(maybeAccount as RpcAccount)
    );
}

export function getEscrowAccountGpaBuilder(
  context: Pick<Context, 'rpc' | 'programs'>
) {
  const programId = context.programs.getPublicKey(
    'useraccount',
    'KoNT93eGXFcQJxZQqBvrBLQQCcxEPhKrmZoqFNmxGjk'
  );
  return gpaBuilder(context, programId)
    .registerFields<{
      discriminator: Uint8Array;
      owner: PublicKey;
      amount: number | bigint;
      subscriptionEnd: number | bigint;
      createdAt: number | bigint;
      lastUpdated: number | bigint;
    }>({
      discriminator: [0, bytes({ size: 8 })],
      owner: [8, publicKeySerializer()],
      amount: [40, u64()],
      subscriptionEnd: [48, i64()],
      createdAt: [56, i64()],
      lastUpdated: [64, i64()],
    })
    .deserializeUsing<EscrowAccount>((account) =>
      deserializeEscrowAccount(account)
    )
    .whereField(
      'discriminator',
      new Uint8Array([36, 69, 48, 18, 128, 225, 125, 135])
    );
}

export function getEscrowAccountSize(): number {
  return 72;
}
