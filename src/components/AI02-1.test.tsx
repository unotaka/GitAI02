import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '@/app/AI02-1/page';

// useRouterをモック
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockPush.mockClear(); // 各テストの前にモックをクリア
  });

  it('renders the login form with initial disabled button', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('ID入力フィールド')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード入力フィールド')).toBeInTheDocument();
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('enables the login button when both fields are filled', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText('ID入力フィールド');
    const passwordInput = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(idInput, { target: { name: 'id', value: 'testuser' } });
    expect(loginButton).toBeDisabled(); // パスワードがまだ空なので無効なまま

    fireEvent.change(passwordInput, { target: { name: 'passwordHash', value: 'password' } });
    expect(loginButton).toBeEnabled();
  });

  it('disables the login button when a field is cleared', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText('ID入力フィールド');
    const passwordInput = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(idInput, { target: { name: 'id', value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { name: 'passwordHash', value: 'password' } });
    expect(loginButton).toBeEnabled();

    fireEvent.change(idInput, { target: { name: 'id', value: '' } });
    expect(loginButton).toBeDisabled();
  });

  it('navigates to AI02-3 on successful login', async () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText('ID入力フィールド');
    const passwordInput = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(idInput, { target: { name: 'id', value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { name: 'passwordHash', value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/AI02-3?id=testuser');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // エラーメッセージが表示されていないことを確認
  });

  it('displays an error message on failed login', async () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText('ID入力フィールド');
    const passwordInput = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(idInput, { target: { name: 'id', value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { name: 'passwordHash', value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('IDまたはパスワードが正しくありません。');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('clears the error message when input fields are changed after a failed login', async () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText('ID入力フィールド');
    const passwordInput = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    // 失敗ログインをシミュレート
    fireEvent.change(idInput, { target: { name: 'id', value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { name: 'passwordHash', value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // ID入力フィールドを変更
    fireEvent.change(idInput, { target: { name: 'id', value: 'newinput' } });

    // エラーメッセージが消えていることを確認
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});