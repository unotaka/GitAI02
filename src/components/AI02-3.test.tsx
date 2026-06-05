import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import DisplayIdPage from './page';
import { useSearchParams } from 'next/navigation';

// next/navigationモジュールをモックします。
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

describe('DisplayIdPage', () => {
  test('クエリパラメータにIDが存在する場合、ログインIDを表示する', () => {
    // useSearchParamsが特定のIDを返すようにモックします。
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams('id=testUser123'));

    render(<DisplayIdPage />);

    // ヘッディングとIDが画面に表示されていることを確認します。
    expect(screen.getByRole('heading', { name: 'ログインID' })).toBeInTheDocument();
    expect(screen.getByText('testUser123')).toBeInTheDocument();
    expect(screen.queryByText('IDが見つかりませんでした。')).not.toBeInTheDocument();
  });

  test('クエリパラメータにIDが存在しない場合、「IDが見つかりませんでした。」と表示する', () => {
    // useSearchParamsが空のSearchParamsを返すようにモックします。
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams(''));

    render(<DisplayIdPage />);

    // ヘッディングとエラーメッセージが画面に表示されていることを確認します。
    expect(screen.getByRole('heading', { name: 'ログインID' })).toBeInTheDocument();
    expect(screen.getByText('IDが見つかりませんでした。')).toBeInTheDocument();
    expect(screen.queryByText(/testUser/)).not.toBeInTheDocument(); // IDが表示されていないことを確認
  });

  test('クエリパラメータにidキーがない場合、「IDが見つかりませんでした。」と表示する', () => {
    // useSearchParamsがid以外のパラメータを持つSearchParamsを返すようにモックします。
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams('otherParam=value'));

    render(<DisplayIdPage />);

    // ヘッディングとエラーメッセージが画面に表示されていることを確認します。
    expect(screen.getByRole('heading', { name: 'ログインID' })).toBeInTheDocument();
    expect(screen.getByText('IDが見つかりませんでした。')).toBeInTheDocument();
  });

  test('初期読み込み中にSuspenseのフォールバックコンテンツを表示しない（同期的なモックのため）', () => {
    // useSearchParamsがIDを返すようにモックします。
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams('id=userLoaded'));

    render(<DisplayIdPage />);

    // useSearchParamsのモックが同期的に解決されるため、フォールバックが表示されないことを確認します。
    expect(screen.queryByText('IDを読み込み中...')).not.toBeInTheDocument();
    expect(screen.getByText('userLoaded')).toBeInTheDocument();
  });
});
