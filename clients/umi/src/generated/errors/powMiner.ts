/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import { Program, ProgramError } from '@metaplex-foundation/umi';

type ProgramErrorConstructor = new (
  program: Program,
  cause?: Error
) => ProgramError;
const codeToErrorMap: Map<number, ProgramErrorConstructor> = new Map();
const nameToErrorMap: Map<string, ProgramErrorConstructor> = new Map();

/** InvalidHash: Submitted hash does not match expected hash */
export class InvalidHashError extends ProgramError {
  override readonly name: string = 'InvalidHash';

  readonly code: number = 0x1770; // 6000

  constructor(program: Program, cause?: Error) {
    super('Submitted hash does not match expected hash', program, cause);
  }
}
codeToErrorMap.set(0x1770, InvalidHashError);
nameToErrorMap.set('InvalidHash', InvalidHashError);

/** TooEasy: Hash difficulty too low */
export class TooEasyError extends ProgramError {
  override readonly name: string = 'TooEasy';

  readonly code: number = 0x1771; // 6001

  constructor(program: Program, cause?: Error) {
    super('Hash difficulty too low', program, cause);
  }
}
codeToErrorMap.set(0x1771, TooEasyError);
nameToErrorMap.set('TooEasy', TooEasyError);

/** RewardOverflow: Reward shift overflowed u64 */
export class RewardOverflowError extends ProgramError {
  override readonly name: string = 'RewardOverflow';

  readonly code: number = 0x1772; // 6002

  constructor(program: Program, cause?: Error) {
    super('Reward shift overflowed u64', program, cause);
  }
}
codeToErrorMap.set(0x1772, RewardOverflowError);
nameToErrorMap.set('RewardOverflow', RewardOverflowError);

/** Unauthorized: Caller is not admin */
export class UnauthorizedError extends ProgramError {
  override readonly name: string = 'Unauthorized';

  readonly code: number = 0x1773; // 6003

  constructor(program: Program, cause?: Error) {
    super('Caller is not admin', program, cause);
  }
}
codeToErrorMap.set(0x1773, UnauthorizedError);
nameToErrorMap.set('Unauthorized', UnauthorizedError);

/** ConfigAlreadyInitialized: Config account already initialized */
export class ConfigAlreadyInitializedError extends ProgramError {
  override readonly name: string = 'ConfigAlreadyInitialized';

  readonly code: number = 0x1774; // 6004

  constructor(program: Program, cause?: Error) {
    super('Config account already initialized', program, cause);
  }
}
codeToErrorMap.set(0x1774, ConfigAlreadyInitializedError);
nameToErrorMap.set('ConfigAlreadyInitialized', ConfigAlreadyInitializedError);

/** ConfigNotInitialized: Config account not initialized */
export class ConfigNotInitializedError extends ProgramError {
  override readonly name: string = 'ConfigNotInitialized';

  readonly code: number = 0x1775; // 6005

  constructor(program: Program, cause?: Error) {
    super('Config account not initialized', program, cause);
  }
}
codeToErrorMap.set(0x1775, ConfigNotInitializedError);
nameToErrorMap.set('ConfigNotInitialized', ConfigNotInitializedError);

/** ProofNotInitialized: Proof account not initialized */
export class ProofNotInitializedError extends ProgramError {
  override readonly name: string = 'ProofNotInitialized';

  readonly code: number = 0x1776; // 6006

  constructor(program: Program, cause?: Error) {
    super('Proof account not initialized', program, cause);
  }
}
codeToErrorMap.set(0x1776, ProofNotInitializedError);
nameToErrorMap.set('ProofNotInitialized', ProofNotInitializedError);

/** InvalidMint: Invalid mint */
export class InvalidMintError extends ProgramError {
  override readonly name: string = 'InvalidMint';

  readonly code: number = 0x1777; // 6007

  constructor(program: Program, cause?: Error) {
    super('Invalid mint', program, cause);
  }
}
codeToErrorMap.set(0x1777, InvalidMintError);
nameToErrorMap.set('InvalidMint', InvalidMintError);

/** InvalidChallenge: Invalid challenge */
export class InvalidChallengeError extends ProgramError {
  override readonly name: string = 'InvalidChallenge';

  readonly code: number = 0x1778; // 6008

  constructor(program: Program, cause?: Error) {
    super('Invalid challenge', program, cause);
  }
}
codeToErrorMap.set(0x1778, InvalidChallengeError);
nameToErrorMap.set('InvalidChallenge', InvalidChallengeError);

/** FutureSlot: Provided slot is in the future */
export class FutureSlotError extends ProgramError {
  override readonly name: string = 'FutureSlot';

  readonly code: number = 0x1779; // 6009

  constructor(program: Program, cause?: Error) {
    super('Provided slot is in the future', program, cause);
  }
}
codeToErrorMap.set(0x1779, FutureSlotError);
nameToErrorMap.set('FutureSlot', FutureSlotError);

/** SlotBeforeProof: Provided slot is before proof was initialized */
export class SlotBeforeProofError extends ProgramError {
  override readonly name: string = 'SlotBeforeProof';

  readonly code: number = 0x177a; // 6010

  constructor(program: Program, cause?: Error) {
    super('Provided slot is before proof was initialized', program, cause);
  }
}
codeToErrorMap.set(0x177a, SlotBeforeProofError);
nameToErrorMap.set('SlotBeforeProof', SlotBeforeProofError);

/** NothingToClaim: Nothing to claim */
export class NothingToClaimError extends ProgramError {
  override readonly name: string = 'NothingToClaim';

  readonly code: number = 0x177b; // 6011

  constructor(program: Program, cause?: Error) {
    super('Nothing to claim', program, cause);
  }
}
codeToErrorMap.set(0x177b, NothingToClaimError);
nameToErrorMap.set('NothingToClaim', NothingToClaimError);

/** InvalidBump: Invalid bump */
export class InvalidBumpError extends ProgramError {
  override readonly name: string = 'InvalidBump';

  readonly code: number = 0x177c; // 6012

  constructor(program: Program, cause?: Error) {
    super('Invalid bump', program, cause);
  }
}
codeToErrorMap.set(0x177c, InvalidBumpError);
nameToErrorMap.set('InvalidBump', InvalidBumpError);

/** CapHit: Cap hit */
export class CapHitError extends ProgramError {
  override readonly name: string = 'CapHit';

  readonly code: number = 0x177d; // 6013

  constructor(program: Program, cause?: Error) {
    super('Cap hit', program, cause);
  }
}
codeToErrorMap.set(0x177d, CapHitError);
nameToErrorMap.set('CapHit', CapHitError);

/** InsufficientLamports: Insufficient lamports */
export class InsufficientLamportsError extends ProgramError {
  override readonly name: string = 'InsufficientLamports';

  readonly code: number = 0x177e; // 6014

  constructor(program: Program, cause?: Error) {
    super('Insufficient lamports', program, cause);
  }
}
codeToErrorMap.set(0x177e, InsufficientLamportsError);
nameToErrorMap.set('InsufficientLamports', InsufficientLamportsError);

/** MinCooldown: Please wait before mining again. */
export class MinCooldownError extends ProgramError {
  override readonly name: string = 'MinCooldown';

  readonly code: number = 0x177f; // 6015

  constructor(program: Program, cause?: Error) {
    super('Please wait before mining again.', program, cause);
  }
}
codeToErrorMap.set(0x177f, MinCooldownError);
nameToErrorMap.set('MinCooldown', MinCooldownError);

/** RewardTooHigh: Reward too high */
export class RewardTooHighError extends ProgramError {
  override readonly name: string = 'RewardTooHigh';

  readonly code: number = 0x1780; // 6016

  constructor(program: Program, cause?: Error) {
    super('Reward too high', program, cause);
  }
}
codeToErrorMap.set(0x1780, RewardTooHighError);
nameToErrorMap.set('RewardTooHigh', RewardTooHighError);

/** WrongSlot: Wrong slot */
export class WrongSlotError extends ProgramError {
  override readonly name: string = 'WrongSlot';

  readonly code: number = 0x1781; // 6017

  constructor(program: Program, cause?: Error) {
    super('Wrong slot', program, cause);
  }
}
codeToErrorMap.set(0x1781, WrongSlotError);
nameToErrorMap.set('WrongSlot', WrongSlotError);

/** OverdeliveryNotAllowed: Overdelivery not allowed */
export class OverdeliveryNotAllowedError extends ProgramError {
  override readonly name: string = 'OverdeliveryNotAllowed';

  readonly code: number = 0x1782; // 6018

  constructor(program: Program, cause?: Error) {
    super('Overdelivery not allowed', program, cause);
  }
}
codeToErrorMap.set(0x1782, OverdeliveryNotAllowedError);
nameToErrorMap.set('OverdeliveryNotAllowed', OverdeliveryNotAllowedError);

/** DailyCap: Daily cap hit */
export class DailyCapError extends ProgramError {
  override readonly name: string = 'DailyCap';

  readonly code: number = 0x1783; // 6019

  constructor(program: Program, cause?: Error) {
    super('Daily cap hit', program, cause);
  }
}
codeToErrorMap.set(0x1783, DailyCapError);
nameToErrorMap.set('DailyCap', DailyCapError);

/** InvalidUserAccount: Invalid user account */
export class InvalidUserAccountError extends ProgramError {
  override readonly name: string = 'InvalidUserAccount';

  readonly code: number = 0x1784; // 6020

  constructor(program: Program, cause?: Error) {
    super('Invalid user account', program, cause);
  }
}
codeToErrorMap.set(0x1784, InvalidUserAccountError);
nameToErrorMap.set('InvalidUserAccount', InvalidUserAccountError);

/** InvalidUserAccountOwner: Invalid user account owner */
export class InvalidUserAccountOwnerError extends ProgramError {
  override readonly name: string = 'InvalidUserAccountOwner';

  readonly code: number = 0x1785; // 6021

  constructor(program: Program, cause?: Error) {
    super('Invalid user account owner', program, cause);
  }
}
codeToErrorMap.set(0x1785, InvalidUserAccountOwnerError);
nameToErrorMap.set('InvalidUserAccountOwner', InvalidUserAccountOwnerError);

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 */
export function getPowMinerErrorFromCode(
  code: number,
  program: Program,
  cause?: Error
): ProgramError | null {
  const constructor = codeToErrorMap.get(code);
  return constructor ? new constructor(program, cause) : null;
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 */
export function getPowMinerErrorFromName(
  name: string,
  program: Program,
  cause?: Error
): ProgramError | null {
  const constructor = nameToErrorMap.get(name);
  return constructor ? new constructor(program, cause) : null;
}
