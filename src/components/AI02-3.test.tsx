import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearchParams } from 'next/navigation';
import AI02-4Page from '@/app/AI02-4/page';

// next/navigation の useSearchParams をモック
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

describe('AI02-4Page', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリアし、独立性を保つ
    vi.clearAllMocks();
  });

  it('検索パラメータにIDが存在する場合、IDを表示する', async () => {
    // useSearchParams が特定のIDを返すようにモックする
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams('id=testuser123'));

    render(<AI02-4Page />);

    // Suspense が絡むため、waitFor を使用して要素の出現を待つ
    await waitFor(() => {
      expect(screen.getByText('ログインID表示')).toBeInTheDocument();
      expect(screen.getByText('testuser123')).toBeInTheDocument();
      expect(screen.getByText('これは、ログイン時に使用されたIDです。')).toBeInTheDocument();
    });
  });

  it('検索パラメータにIDが存在しない場合、「IDが見つかりませんでした。」と表示する', async () => {
    // useSearchParams がIDを返さないようにモックする
    (useSearchParams as vi.Mock).mockReturnValue(new URLSearchParams(''));

    render(<AI02-4Page />);

    await waitFor(() => {
      expect(screen.getByText('ログインID表示')).toBeInTheDocument();
      expect(screen.getByText('IDが見つかりませんでした。')).toBeInTheDocument();
    });
  });

  // 備考:
  // `useSearchParams`はクライアントコンポーネント内では同期的に動作するため、
  // 通常のレンダリングでは `Suspense` の `fallback` は表示されません。
  // `fallback` の表示をテストするには、`useSearchParams` のモックが非同期的に値を返すか、
  // Promiseを投げるような複雑な設定が必要になりますが、これはこのタスクの範囲を超えます。
  // 本テストでは、IDの有無による主要コンテンツの表示ロジックを検証することに焦点を当てています。
});