import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SwapUnit } from '../types';
import { useResetInputs } from './useResetInputs';

describe('useResetInputs', () => {
  const mockFromTokenResponse = {
    refetch: vi.fn().mockResolvedValue(undefined),
  };
  const mockToTokenResponse = { refetch: vi.fn().mockResolvedValue(undefined) };
  const mockFrom: SwapUnit = {
    balance: '100',
    balanceResponse: mockFromTokenResponse,
    amount: '50',
    setAmount: vi.fn(),
    token: undefined,
    setToken: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };
  const mockTo: SwapUnit = {
    balance: '200',
    balanceResponse: mockToTokenResponse,
    amount: '75',
    setAmount: vi.fn(),
    token: undefined,
    setToken: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() =>
      useResetInputs({ from: mockFrom, to: mockTo }),
    );
    expect(typeof result.current).toBe('function');
  });

  it('should call refetch on responses and setAmount on both from and to when executed', async () => {
    const { result } = renderHook(() =>
      useResetInputs({ from: mockFrom, to: mockTo }),
    );
    await act(async () => {
      await result.current();
    });
    expect(mockFromTokenResponse.refetch).toHaveBeenCalledTimes(1);
    expect(mockToTokenResponse.refetch).toHaveBeenCalledTimes(1);
    expect(mockFrom.setAmount).toHaveBeenCalledWith('');
    expect(mockTo.setAmount).toHaveBeenCalledWith('');
  });

  it("should not create a new function reference if from and to haven't changed", () => {
    const { result, rerender } = renderHook(() =>
      useResetInputs({ from: mockFrom, to: mockTo }),
    );
    const firstRender = result.current;
    rerender();
    expect(result.current).toBe(firstRender);
  });

  it('should create a new function reference if from or to change', () => {
    const { result, rerender } = renderHook(
      ({ from, to }) => useResetInputs({ from, to }),
      { initialProps: { from: mockFrom, to: mockTo } },
    );
    const firstRender = result.current;
    const newMockFrom = {
      ...mockFrom,
      response: { refetch: vi.fn().mockResolvedValue(undefined) },
    };
    rerender({ from: newMockFrom, to: mockTo });
    expect(result.current).not.toBe(firstRender);
  });

  it('should handle null responses gracefully', async () => {
    const mockFromWithNullResponse = { ...mockFrom, response: null };
    const mockToWithNullResponse = { ...mockTo, response: null };
    const { result } = renderHook(() =>
      useResetInputs({
        from: mockFromWithNullResponse,
        to: mockToWithNullResponse,
      }),
    );
    await act(async () => {
      await result.current();
    });
    expect(mockFromWithNullResponse.setAmount).toHaveBeenCalledWith('');
    expect(mockToWithNullResponse.setAmount).toHaveBeenCalledWith('');
  });
});
