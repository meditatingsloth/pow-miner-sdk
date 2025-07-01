import { address } from 'gill';

export * from '@pow-miner-sdk/core';
export * from './generated';

import {
  BGLD as baseBGLD,
  FEE_RECEIVER as baseFEE_RECEIVER,
} from '@pow-miner-sdk/core';

export const BGLD = address(baseBGLD);
export const FEE_RECEIVER = address(baseFEE_RECEIVER);
