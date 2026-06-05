import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginIdPage from './page';

// next/navigation モジュール全体をモック
const mockUseSearchParams = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
}));

describe('LoginIdPage', () => {
  beforeEach(() => {
    // 各テストの前にモックの状態をリセット
    mockUseSearchParams.mockReset();
  });

  it('displays the user ID when an ID is provided in the URL', () => {
    // useSearchParamsが特定のIDを返すように設定
    mockUseSearchParams.mockReturnValue(new URLSearchParams('id=test-user-123'));

    render(<LoginIdPage />);

    expect(screen.getByText('ログインID')).toBeInTheDocument();
    expect(screen.getByText('test-user-123')).toBeInTheDocument();
    expect(screen.queryByText('ログインIDが指定されていません。')).not.toBeInTheDocument();
  });

  it('displays a message when no ID is provided in the URL', () => {
    // useSearchParamsがIDなしを返すように設定
    mockUseSearchParams.mockReturnValue(new URLSearchParams(''));

    render(<LoginIdPage />);

    expect(screen.getByText('ログインID')).toBeInTheDocument();
    expect(screen.getByText('ログインIDが指定されていません。')).toBeInTheDocument();
    expect(screen.queryByText('test-user-123')).not.toBeInTheDocument();
  });

  it('renders with responsive classes for centering and text sizes', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('id=responsive-test'));

    const { container } = render(<LoginIdPage />);

    // 最上位のdivがセンタリングと最小の高さを確保していることを確認
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen');

    // ログインIDのタイトルにレスポンシブな文字サイズが適用されていることを確認
    const loginIdTitle = screen.getByText('ログインID');
    expect(loginIdTitle).toHaveClass('text-3xl', 'md:text-4xl', 'lg:text-5xl');

    // ユーザーIDの表示にレスポンシブな文字サイズが適用されていることを確認
    const userIdDisplay = screen.getByText('responsive-test');
    expect(userIdDisplay).toHaveClass('text-xl', 'md:text-2xl', 'lg:text-3xl');
  });
});