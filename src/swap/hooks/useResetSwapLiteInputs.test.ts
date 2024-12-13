import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SwapUnit } from '../types';
import { useResetSwapLiteInputs } from './useResetSwapLiteInputs';

describe('useResetSwapLiteInputs', () => {
  const mockFromTokenResponse = {
    refetch: vi.fn().mockResolvedValue(undefined),
  };
  const mockFromETHTokenResponse = {
    refetch: vi.fn().mockResolvedValue(undefined),
  };
  const mockFromUSDCTokenResponse = {
    refetch: vi.fn().mockResolvedValue(undefined),
  };
  const mockToTokenResponse = { refetch: vi.fn().mockResolvedValue(undefined) };
  const mockFrom: SwapUnit = {
    balance: '100',
    balanceResponse: mockFromTokenResponse,
    amount: '50',
    setAmount: vi.fn(),
    setAmountUSD: vi.fn(),
    token: undefined,
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };
  const mockFromETH: SwapUnit = {
    balance: '100',
    balanceResponse: mockFromETHTokenResponse,
    amount: '50',
    setAmount: vi.fn(),
    setAmountUSD: vi.fn(),
    token: undefined,
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };
  const mockFromUSDC: SwapUnit = {
    balance: '100',
    balanceResponse: mockFromUSDCTokenResponse,
    amount: '50',
    setAmount: vi.fn(),
    setAmountUSD: vi.fn(),
    token: undefined,
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };
  const mockTo: SwapUnit = {
    balance: '200',
    balanceResponse: mockToTokenResponse,
    amount: '75',
    setAmount: vi.fn(),
    setAmountUSD: vi.fn(),
    token: undefined,
    loading: false,
    setLoading: vi.fn(),
    error: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() =>
      useResetSwapLiteInputs({
        fromETH: mockFromETH,
        fromUSDC: mockFromUSDC,
        from: mockFrom,
        to: mockTo,
      }),
    );
    expect(typeof result.current).toBe('function');
  });

  it('should call refetch on responses and set amounts to empty strings when executed', async () => {
    const { result } = renderHook(() =>
      useResetSwapLiteInputs({
        fromETH: mockFromETH,
        fromUSDC: mockFromUSDC,
        from: mockFrom,
        to: mockTo,
      }),
    );
    await act(async () => {
      await result.current();
    });
    expect(mockFromETHTokenResponse.refetch).toHaveBeenCalledTimes(1);
    expect(mockToTokenResponse.refetch).toHaveBeenCalledTimes(1);
    expect(mockFromETH.setAmount).toHaveBeenCalledWith('');
    expect(mockFromETH.setAmountUSD).toHaveBeenCalledWith('');
    expect(mockTo.setAmount).toHaveBeenCalledWith('');
    expect(mockTo.setAmountUSD).toHaveBeenCalledWith('');
  });

  it("should not create a new function reference if from and to haven't changed", () => {
    const { result, rerender } = renderHook(() =>
      useResetSwapLiteInputs({
        fromETH: mockFromETH,
        fromUSDC: mockFromUSDC,
        to: mockTo,
      }),
    );
    const firstRender = result.current;
    rerender();
    expect(result.current).toBe(firstRender);
  });

  it('should create a new function reference if from or to change', () => {
    const { result, rerender } = renderHook(
      ({ fromETH, fromUSDC, to }) =>
        useResetSwapLiteInputs({
          fromETH,
          fromUSDC,
          to,
        }),
      {
        initialProps: {
          fromETH: mockFromETH,
          fromUSDC: mockFromUSDC,
          to: mockTo,
        },
      },
    );
    const firstRender = result.current;
    const newMockFromETH = {
      ...mockFromETH,
      balanceResponse: { refetch: vi.fn().mockResolvedValue(undefined) },
    };
    const newMockFromUSDC = {
      ...mockFromUSDC,
      balanceResponse: { refetch: vi.fn().mockResolvedValue(undefined) },
    };
    rerender({
      fromETH: newMockFromETH,
      fromUSDC: newMockFromUSDC,
      to: mockTo,
    });
    expect(result.current).not.toBe(firstRender);
  });

  it('should handle null responses gracefully', async () => {
    const mockFromWithNullResponse = { ...mockFromETH, balanceResponse: null };
    const mockFromUSDCWithNullResponse = {
      ...mockFromUSDC,
      balanceResponse: null,
    };
    const mockToWithNullResponse = { ...mockTo, balanceResponse: null };
    const { result } = renderHook(() =>
      useResetSwapLiteInputs({
        fromETH: mockFromWithNullResponse,
        fromUSDC: mockFromUSDCWithNullResponse,
        to: mockToWithNullResponse,
      }),
    );
    await act(async () => {
      await result.current();
    });
    expect(mockFromWithNullResponse.setAmount).toHaveBeenCalledWith('');
    expect(mockFromWithNullResponse.setAmountUSD).toHaveBeenCalledWith('');
    expect(mockToWithNullResponse.setAmount).toHaveBeenCalledWith('');
    expect(mockToWithNullResponse.setAmountUSD).toHaveBeenCalledWith('');
  });
});
