import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoginIdDisplayPage from './page';

describe('LoginIdDisplayPage', () => {
  it('should display the hardcoded user ID in the document', () => {
    render(<LoginIdDisplayPage />);

    // 「ログインID」の見出しが表示されていることを確認
    expect(screen.getByRole('heading', { name: /ログインID/i })).toBeInTheDocument();

    // ハードコードされたユーザーID「user-12345」が表示されていることを確認
    expect(screen.getByText('user-12345')).toBeInTheDocument();

    // 説明文が表示されていることを確認
    expect(screen.getByText(/このIDは、ログイン時に使用されました。/i)).toBeInTheDocument();
  });
});