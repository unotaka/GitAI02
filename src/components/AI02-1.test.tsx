import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '@/app/login/page';
import React from 'react';

// useRouterをモック
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ID入力フィールド/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード入力フィールド/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('login button is disabled when form is empty', () => {
    render(<LoginPage />);
    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeDisabled();
  });

  it('login button is enabled when form is filled', () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(loginButton).not.toBeDisabled();
  });

  it('displays error message on invalid login credentials', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('IDまたはパスワードが正しくありません。');
    });
    expect(mockPush).not.toHaveBeenCalled();
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
      expect(mockPush).toHaveBeenCalledWith('/AI02-3?id=testuser');
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('clears error message when input changes after an error', async () => {
    render(<LoginPage />);
    const idInput = screen.getByLabelText(/ID入力フィールド/i);
    const passwordInput = screen.getByLabelText(/パスワード入力フィールド/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.change(idInput, { target: { value: 't' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});