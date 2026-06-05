import { render, screen, fireEvent } from '@testing-library/react';
import { vitest, expect, beforeEach } from 'vitest';
import { LoginPage } from './page';
import { useRouter } from 'next/navigation';

// Mock next/navigation's useRouter
vitest.mock('next/navigation', () => ({
  useRouter: vitest.fn(() => ({
    push: vitest.fn(),
    replace: vitest.fn(),
    reload: vitest.fn(),
    back: vitest.fn(),
    prefetch: vitest.fn(),
    beforePopState: vitest.fn(),
    events: {
      on: vitest.fn(),
      off: vitest.fn(),
      emit: vitest.fn(),
    },
  })),
}));

describe('LoginPage', () => {
  const mockRouter = { push: vitest.fn() };

  beforeEach(() => {
    vitest.clearAllMocks();
    (useRouter as vitest.Mock).mockReturnValue(mockRouter);
  });

  it('renders ID and Password inputs and a Login button', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/ID:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('allows users to type into the ID and Password fields', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID:/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password:/i) as HTMLInputElement;

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(idInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  it('navigates to /main when the Login button is clicked with valid input', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID:/i);
    const passwordInput = screen.getByLabelText(/Password:/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(mockRouter.push).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/main');
  });

  it('does not navigate if ID field is empty on form submission (browser validation)', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/Password:/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Modern browsers prevent form submission for required fields, so push should not be called
    // Vitest/JSDOM doesn't fully simulate browser validation, so we assert it's not called directly if onSubmit isn't triggered.
    // If onSubmit *were* triggered without valid fields, this test would be different.
    // For this test, we verify that client-side logic doesn't bypass browser validation.
    // Since 'required' is used, the form won't submit. So push should NOT be called.
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('does not navigate if Password field is empty on form submission (browser validation)', () => {
    render(<LoginPage />);

    const idInput = screen.getByLabelText(/ID:/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(idInput, { target: { value: 'testuser' } });
    fireEvent.click(loginButton);

    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
