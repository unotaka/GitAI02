import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, describe, vi } from 'vitest';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('renders ID and PASSWORD input fields and a login button', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    expect(screen.getByLabelText('ID入力フィールド')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード入力フィールド')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('allows typing into the ID input field', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const idInputField = screen.getByLabelText('ID入力フィールド');
    fireEvent.change(idInputField, { target: { value: 'testuser' } });
    expect(idInputField).toHaveValue('testuser');
  });

  it('allows typing into the PASSWORD input field', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const passwordInputField = screen.getByLabelText('パスワード入力フィールド');
    fireEvent.change(passwordInputField, { target: { value: 'testpassword' } });
    expect(passwordInputField).toHaveValue('testpassword');
  });

  it('login button is disabled initially when fields are empty', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    expect(loginButton).toBeDisabled();
  });

  it('login button becomes enabled when both fields have input', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const idInputField = screen.getByLabelText('ID入力フィールド');
    const passwordInputField = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(idInputField, { target: { value: 'testuser' } });
    expect(loginButton).toBeDisabled(); // Only ID is entered

    fireEvent.change(passwordInputField, { target: { value: 'testpassword' } });
    expect(loginButton).toBeEnabled(); // Both fields are entered
  });

  it('calls onLogin with correct credentials when the form is submitted', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const idInputField = screen.getByLabelText('ID入力フィールド');
    const passwordInputField = screen.getByLabelText('パスワード入力フィールド');
    const loginButton = screen.getByRole('button', { name: 'ログイン' });

    fireEvent.change(idInputField, { target: { value: 'testuser' } });
    fireEvent.change(passwordInputField, { target: { value: 'testpassword' } });
    fireEvent.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
    expect(mockOnLogin).toHaveBeenCalledWith('testuser', 'testpassword');
  });

  it('does not call onLogin if login button is clicked while disabled', () => {
    const mockOnLogin = vi.fn();
    render(<LoginForm onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button', { name: 'ログイン' });
    expect(loginButton).toBeDisabled();

    fireEvent.click(loginButton);
    expect(mockOnLogin).not.toHaveBeenCalled();

    const idInputField = screen.getByLabelText('ID入力フィールド');
    fireEvent.change(idInputField, { target: { value: 'testuser' } });
    expect(loginButton).toBeDisabled(); // Only ID is entered
    fireEvent.click(loginButton);
    expect(mockOnLogin).not.toHaveBeenCalled();
  });
});
