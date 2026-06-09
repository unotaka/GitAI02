import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '@/app/AI02-1/page';
import { useRouter } from 'next/navigation';

// useRouterをモック化
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// モックされたrouterオブジェクトのpush関数を定義
const mockPush = vi.fn();
(useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  push: mockPush,
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
});

describe('LoginPage', () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    mockPush.mockClear();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockClear();
  });

  it('renders login form elements correctly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ID入力フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード入力フィールド/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/テストアカウント: ID: testuser, パスワード: password/i)).toBeInTheDocument();
  });

  it('login button is disabled when form is empty', () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeDisabled();
  });

  it('login button is enabled when form is valid', () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(loginButton).toBeEnabled();
  });

  it('updates ID input value onChange', () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i) as HTMLInputElement;
    fireEvent.change(idInput, { target: { value: 'newid' } });
    expect(idInput.value).toBe('newid');
  });

  it('updates password input value onChange', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i) as HTMLInputElement;
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    expect(passwordInput.value).toBe('newpassword');
  });

  it('navigates to /AI02-3 with ID on successful login', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/AI02-3?id=testuser');
    });
  });

  it('displays error message on failed login (incorrect password)', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('IDまたはパスワードが正しくありません。');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays error message on failed login (incorrect ID)', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('IDまたはパスワードが正しくありません。');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('error message clears on subsequent successful login attempt', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // まず、ログイン失敗をシミュレート
    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('IDまたはパスワードが正しくありません。');
    });

    // 次に、成功するログインを試行
    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // エラーメッセージが消えていることを確認
      expect(mockPush).toHaveBeenCalledWith('/AI02-3?id=testuser');
    });
  });

  it('should not navigate if login fails and error message is displayed', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});