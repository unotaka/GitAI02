import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DisplayIdPage from '../app/AI02-4/page';

// next/navigation をモック
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

describe('DisplayIdPage', () => {
  const { useSearchParams } = require('next/navigation');

  // useSearchParamsは同期的にモックされるため、通常fallbackは表示されないことを確認する
  it('does not render loading fallback initially as useSearchParams is mocked synchronously', () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('id=testUser123'));
    render(<DisplayIdPage />);
    expect(screen.queryByText('IDを読み込み中...')).not.toBeInTheDocument();
  });

  it('displays the ID when present in search params', async () => {
    const mockId = 'testUser123';
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams(`id=${mockId}`));

    render(<DisplayIdPage />);

    await waitFor(() => {
      expect(screen.getByText('ログインID')).toBeInTheDocument();
    });
    expect(screen.getByText(mockId)).toBeInTheDocument();
    expect(screen.getByText('これは、ログイン時に使用されたIDです。')).toBeInTheDocument();
    expect(screen.queryByText('IDが見つかりませんでした。')).not.toBeInTheDocument();
  });

  it('displays "IDが見つかりませんでした。" when ID is not present', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('name=value'));

    render(<DisplayIdPage />);

    await waitFor(() => {
      expect(screen.getByText('ログインID')).toBeInTheDocument();
    });
    expect(screen.getByText('IDが見つかりませんでした。')).toBeInTheDocument();
    expect(screen.queryByText('これは、ログイン時に使用されたIDです。')).not.toBeInTheDocument();
  });

  it('displays "IDが見つかりませんでした。" when ID is an empty string', async () => {
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams('id='));

    render(<DisplayIdPage />);

    await waitFor(() => {
      expect(screen.getByText('ログインID')).toBeInTheDocument();
    });
    expect(screen.getByText('IDが見つかりませんでした。')).toBeInTheDocument();
    expect(screen.queryByText('これは、ログイン時に使用されたIDです。')).not.toBeInTheDocument();
    expect(screen.queryByText('')).not.toBeInTheDocument(); // 空のIDが表示されないことを確認
  });
});