import { openPopup } from '@/ui-react/internal/utils/openPopup';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { BuyDropdown } from './BuyDropdown';
import { useBuyContext } from './BuyProvider';
import { degenToken, ethToken, usdcToken } from '../../token/constants';

vi.mock('./BuyProvider', () => ({
  useBuyContext: vi.fn(),
}));

vi.mock('@/ui-react/internal/utils/openPopup', () => ({
  openPopup: vi.fn(),
}));

vi.mock('../../core/utils/getRoundedAmount', () => ({
  getRoundedAmount: vi.fn(() => '10'),
}));

vi.mock('../../fund/utils/getFundingPopupSize', () => ({
  getFundingPopupSize: vi.fn(() => ({ height: 600, width: 400 })),
}));

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<any>('wagmi');
  return {
    ...actual,
    useAccount: () => ({ address: '0xMockAddress' }),
  };
});

const mockStartPopupMonitor = vi.fn();

const mockContextValue = {
  to: {
    token: degenToken,
    amount: '1.23',
    amountUSD: '123.45',
  },
  fromETH: { token: ethToken },
  fromUSDC: { token: usdcToken },
  from: { token: { symbol: 'DAI' } },
  projectId: 'mock-project-id',
  startPopupMonitor: mockStartPopupMonitor,
  setIsDropdownOpen: vi.fn(),
};

describe('BuyDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useBuyContext as Mock).mockReturnValue(mockContextValue);
  });

  it('renders the dropdown with correct content', () => {
    render(<BuyDropdown />);

    expect(screen.getByText('Buy with')).toBeInTheDocument();
    expect(screen.getByText('10 ETH')).toBeInTheDocument();
    expect(screen.getByText('10 USDC')).toBeInTheDocument();
    expect(screen.getByText('1.23 DEGEN ≈ $10.00')).toBeInTheDocument();
  });

  it('triggers handleOnrampClick on payment method click', () => {
    (openPopup as Mock).mockReturnValue('popup');
    render(<BuyDropdown />);

    const onrampButton = screen.getByTestId('ock-applePayOrampItem');

    act(() => {
      fireEvent.click(onrampButton);
    });

    expect(mockStartPopupMonitor).toHaveBeenCalled();
  });

  it('does not render formatted amount if amountUSD is missing', () => {
    const contextWithNoUSD = {
      ...mockContextValue,
      to: { ...mockContextValue.to, amountUSD: '0' },
    };
    (useBuyContext as Mock).mockReturnValue(contextWithNoUSD);

    render(<BuyDropdown />);

    expect(screen.queryByText(/≈/)).not.toBeInTheDocument();
  });
});
