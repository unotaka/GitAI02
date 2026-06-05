import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '@/app/login/page';
import { useRouter } from 'next/navigation';

// useRouter をモック化
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// window.alert をモック化
const mockAlert = vi.fn();
global.alert = mockAlert;

describe('LoginPage', () => {
  beforeEach(() => {
    // 各テストケースの前にモックの状態をリセット
    mockPush.mockClear();
    mockAlert.mockClear();
  });

  it('should render login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ID入力欄/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード入力欄/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should update ID and PASSWORD on input change', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID入力欄/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/パスワード入力欄/i) as HTMLInputElement;

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(idInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });

  it('should show alert if ID or PASSWORD is empty on login', async () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole('button', { name: /Login/i });

    // IDもパスワードも空の場合
    fireEvent.click(loginButton);
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('IDとPASSWORDを入力してください。');
    });
    expect(mockPush).not.toHaveBeenCalled();

    mockAlert.mockClear();

    // IDのみ入力（パスワードが空）
    const idInput = screen.getByLabelText(/ID入力欄/i);
    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.click(loginButton);
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('IDとPASSWORDを入力してください。');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should show alert for incorrect credentials', async () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID入力欄/i);
    const passwordInput = screen.getByLabelText(/パスワード入力欄/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('IDまたはPASSWORDが間違っています。');
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should navigate to main page on successful login', async () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID入力欄/i);
    const passwordInput = screen.getByLabelText(/パスワード入力欄/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // 成功する認証情報（ダミー）
    fireEvent.change(idInput, { target: { value: 'user' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('ログイン成功！');
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});