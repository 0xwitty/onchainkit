import { useCallback } from 'react';
import type { FromTo } from '../types';

// Refreshes balances and inputs post-swap
export const useResetInputs = ({ from, to }: FromTo) => {
  return useCallback(async () => {
    await Promise.all([
      from.refetch(),
      to.refetch(),
      from.setAmount(''),
      to.setAmount(''),
    ]);
  }, [from, to]);
};