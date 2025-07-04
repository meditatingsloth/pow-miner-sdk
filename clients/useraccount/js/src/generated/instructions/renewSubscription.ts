/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
} from '@solana/kit';
import { findProgramStatePda } from '../pdas';
import { USERACCOUNT_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const RENEW_SUBSCRIPTION_DISCRIMINATOR = new Uint8Array([
  45, 75, 154, 194, 160, 10, 111, 183,
]);

export function getRenewSubscriptionDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    RENEW_SUBSCRIPTION_DISCRIMINATOR
  );
}

export type RenewSubscriptionInstruction<
  TProgram extends string = typeof USERACCOUNT_PROGRAM_ADDRESS,
  TAccountUser extends string | IAccountMeta<string> = string,
  TAccountEscrow extends string | IAccountMeta<string> = string,
  TAccountMaster extends string | IAccountMeta<string> = string,
  TAccountMasterSigner extends string | IAccountMeta<string> = string,
  TAccountRecipient extends string | IAccountMeta<string> = string,
  TAccountAuthority extends string | IAccountMeta<string> = string,
  TAccountFeeProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountProgramState extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountUser extends string
        ? WritableAccount<TAccountUser>
        : TAccountUser,
      TAccountEscrow extends string
        ? WritableAccount<TAccountEscrow>
        : TAccountEscrow,
      TAccountMaster extends string
        ? WritableAccount<TAccountMaster>
        : TAccountMaster,
      TAccountMasterSigner extends string
        ? ReadonlySignerAccount<TAccountMasterSigner> &
            IAccountSignerMeta<TAccountMasterSigner>
        : TAccountMasterSigner,
      TAccountRecipient extends string
        ? WritableAccount<TAccountRecipient>
        : TAccountRecipient,
      TAccountAuthority extends string
        ? WritableAccount<TAccountAuthority>
        : TAccountAuthority,
      TAccountFeeProgram extends string
        ? WritableAccount<TAccountFeeProgram>
        : TAccountFeeProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountProgramState extends string
        ? WritableAccount<TAccountProgramState>
        : TAccountProgramState,
      ...TRemainingAccounts,
    ]
  >;

export type RenewSubscriptionInstructionData = {
  discriminator: ReadonlyUint8Array;
  feeAmount: bigint;
};

export type RenewSubscriptionInstructionDataArgs = {
  feeAmount: number | bigint;
};

export function getRenewSubscriptionInstructionDataEncoder(): Encoder<RenewSubscriptionInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['feeAmount', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: RENEW_SUBSCRIPTION_DISCRIMINATOR })
  );
}

export function getRenewSubscriptionInstructionDataDecoder(): Decoder<RenewSubscriptionInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['feeAmount', getU64Decoder()],
  ]);
}

export function getRenewSubscriptionInstructionDataCodec(): Codec<
  RenewSubscriptionInstructionDataArgs,
  RenewSubscriptionInstructionData
> {
  return combineCodec(
    getRenewSubscriptionInstructionDataEncoder(),
    getRenewSubscriptionInstructionDataDecoder()
  );
}

export type RenewSubscriptionAsyncInput<
  TAccountUser extends string = string,
  TAccountEscrow extends string = string,
  TAccountMaster extends string = string,
  TAccountMasterSigner extends string = string,
  TAccountRecipient extends string = string,
  TAccountAuthority extends string = string,
  TAccountFeeProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountProgramState extends string = string,
> = {
  user?: Address<TAccountUser>;
  escrow?: Address<TAccountEscrow>;
  master?: Address<TAccountMaster>;
  masterSigner: TransactionSigner<TAccountMasterSigner>;
  recipient: Address<TAccountRecipient>;
  authority: Address<TAccountAuthority>;
  feeProgram?: Address<TAccountFeeProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  programState?: Address<TAccountProgramState>;
  feeAmount: RenewSubscriptionInstructionDataArgs['feeAmount'];
};

export async function getRenewSubscriptionInstructionAsync<
  TAccountUser extends string,
  TAccountEscrow extends string,
  TAccountMaster extends string,
  TAccountMasterSigner extends string,
  TAccountRecipient extends string,
  TAccountAuthority extends string,
  TAccountFeeProgram extends string,
  TAccountSystemProgram extends string,
  TAccountProgramState extends string,
  TProgramAddress extends Address = typeof USERACCOUNT_PROGRAM_ADDRESS,
>(
  input: RenewSubscriptionAsyncInput<
    TAccountUser,
    TAccountEscrow,
    TAccountMaster,
    TAccountMasterSigner,
    TAccountRecipient,
    TAccountAuthority,
    TAccountFeeProgram,
    TAccountSystemProgram,
    TAccountProgramState
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  RenewSubscriptionInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountEscrow,
    TAccountMaster,
    TAccountMasterSigner,
    TAccountRecipient,
    TAccountAuthority,
    TAccountFeeProgram,
    TAccountSystemProgram,
    TAccountProgramState
  >
> {
  // Program address.
  const programAddress = config?.programAddress ?? USERACCOUNT_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    escrow: { value: input.escrow ?? null, isWritable: true },
    master: { value: input.master ?? null, isWritable: true },
    masterSigner: { value: input.masterSigner ?? null, isWritable: false },
    recipient: { value: input.recipient ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: true },
    feeProgram: { value: input.feeProgram ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    programState: { value: input.programState ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.user.value) {
    accounts.user.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([117, 115, 101, 114])),
        getAddressEncoder().encode(expectAddress(accounts.authority.value)),
      ],
    });
  }
  if (!accounts.escrow.value) {
    accounts.escrow.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([101, 115, 99, 114, 111, 119])),
        getAddressEncoder().encode(expectAddress(accounts.user.value)),
      ],
    });
  }
  if (!accounts.master.value) {
    accounts.master.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(new Uint8Array([109, 97, 115, 116, 101, 114])),
      ],
    });
  }
  if (!accounts.feeProgram.value) {
    accounts.feeProgram.value = await getProgramDerivedAddress({
      programAddress,
      seeds: [
        getBytesEncoder().encode(
          new Uint8Array([102, 101, 101, 95, 112, 114, 111, 103, 114, 97, 109])
        ),
      ],
    });
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.programState.value) {
    accounts.programState.value = await findProgramStatePda();
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.escrow),
      getAccountMeta(accounts.master),
      getAccountMeta(accounts.masterSigner),
      getAccountMeta(accounts.recipient),
      getAccountMeta(accounts.authority),
      getAccountMeta(accounts.feeProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.programState),
    ],
    programAddress,
    data: getRenewSubscriptionInstructionDataEncoder().encode(
      args as RenewSubscriptionInstructionDataArgs
    ),
  } as RenewSubscriptionInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountEscrow,
    TAccountMaster,
    TAccountMasterSigner,
    TAccountRecipient,
    TAccountAuthority,
    TAccountFeeProgram,
    TAccountSystemProgram,
    TAccountProgramState
  >;

  return instruction;
}

export type RenewSubscriptionInput<
  TAccountUser extends string = string,
  TAccountEscrow extends string = string,
  TAccountMaster extends string = string,
  TAccountMasterSigner extends string = string,
  TAccountRecipient extends string = string,
  TAccountAuthority extends string = string,
  TAccountFeeProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountProgramState extends string = string,
> = {
  user: Address<TAccountUser>;
  escrow: Address<TAccountEscrow>;
  master: Address<TAccountMaster>;
  masterSigner: TransactionSigner<TAccountMasterSigner>;
  recipient: Address<TAccountRecipient>;
  authority: Address<TAccountAuthority>;
  feeProgram: Address<TAccountFeeProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  programState: Address<TAccountProgramState>;
  feeAmount: RenewSubscriptionInstructionDataArgs['feeAmount'];
};

export function getRenewSubscriptionInstruction<
  TAccountUser extends string,
  TAccountEscrow extends string,
  TAccountMaster extends string,
  TAccountMasterSigner extends string,
  TAccountRecipient extends string,
  TAccountAuthority extends string,
  TAccountFeeProgram extends string,
  TAccountSystemProgram extends string,
  TAccountProgramState extends string,
  TProgramAddress extends Address = typeof USERACCOUNT_PROGRAM_ADDRESS,
>(
  input: RenewSubscriptionInput<
    TAccountUser,
    TAccountEscrow,
    TAccountMaster,
    TAccountMasterSigner,
    TAccountRecipient,
    TAccountAuthority,
    TAccountFeeProgram,
    TAccountSystemProgram,
    TAccountProgramState
  >,
  config?: { programAddress?: TProgramAddress }
): RenewSubscriptionInstruction<
  TProgramAddress,
  TAccountUser,
  TAccountEscrow,
  TAccountMaster,
  TAccountMasterSigner,
  TAccountRecipient,
  TAccountAuthority,
  TAccountFeeProgram,
  TAccountSystemProgram,
  TAccountProgramState
> {
  // Program address.
  const programAddress = config?.programAddress ?? USERACCOUNT_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    user: { value: input.user ?? null, isWritable: true },
    escrow: { value: input.escrow ?? null, isWritable: true },
    master: { value: input.master ?? null, isWritable: true },
    masterSigner: { value: input.masterSigner ?? null, isWritable: false },
    recipient: { value: input.recipient ?? null, isWritable: true },
    authority: { value: input.authority ?? null, isWritable: true },
    feeProgram: { value: input.feeProgram ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    programState: { value: input.programState ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.user),
      getAccountMeta(accounts.escrow),
      getAccountMeta(accounts.master),
      getAccountMeta(accounts.masterSigner),
      getAccountMeta(accounts.recipient),
      getAccountMeta(accounts.authority),
      getAccountMeta(accounts.feeProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.programState),
    ],
    programAddress,
    data: getRenewSubscriptionInstructionDataEncoder().encode(
      args as RenewSubscriptionInstructionDataArgs
    ),
  } as RenewSubscriptionInstruction<
    TProgramAddress,
    TAccountUser,
    TAccountEscrow,
    TAccountMaster,
    TAccountMasterSigner,
    TAccountRecipient,
    TAccountAuthority,
    TAccountFeeProgram,
    TAccountSystemProgram,
    TAccountProgramState
  >;

  return instruction;
}

export type ParsedRenewSubscriptionInstruction<
  TProgram extends string = typeof USERACCOUNT_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    user: TAccountMetas[0];
    escrow: TAccountMetas[1];
    master: TAccountMetas[2];
    masterSigner: TAccountMetas[3];
    recipient: TAccountMetas[4];
    authority: TAccountMetas[5];
    feeProgram: TAccountMetas[6];
    systemProgram: TAccountMetas[7];
    programState: TAccountMetas[8];
  };
  data: RenewSubscriptionInstructionData;
};

export function parseRenewSubscriptionInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedRenewSubscriptionInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 9) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      user: getNextAccount(),
      escrow: getNextAccount(),
      master: getNextAccount(),
      masterSigner: getNextAccount(),
      recipient: getNextAccount(),
      authority: getNextAccount(),
      feeProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      programState: getNextAccount(),
    },
    data: getRenewSubscriptionInstructionDataDecoder().decode(instruction.data),
  };
}
