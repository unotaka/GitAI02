import { render, screen } from '@testing-library/react';
import { LoginIdDisplay } from './LoginIdDisplay';
import { expect, test, describe } from 'vitest';

describe('LoginIdDisplay', () => {
  test('should display the provided user ID', () => {
    const userId = 'testUser123';
    render(<LoginIdDisplay userId={userId} />);

    // ユーザーIDが表示されていることを確認
    const userIdElement = screen.getByText(`ログインID: ${userId}`);
    expect(userIdElement).toBeInTheDocument();
    expect(userIdElement).toHaveClass('text-xl');
    expect(userIdElement).toHaveClass('font-semibold');
    expect(userIdElement).toHaveClass('text-indigo-700');
  });

  test('should display a different user ID correctly', () => {
    const anotherUserId = 'anotherUserABC';
    render(<LoginIdDisplay userId={anotherUserId} />);

    // 別のユーザーIDが表示されていることを確認
    const anotherUserIdElement = screen.getByText(`ログインID: ${anotherUserId}`);
    expect(anotherUserIdElement).toBeInTheDocument();
  });

  test('should have the correct structure and classes', () => {
    const userId = 'structureTest';
    render(<LoginIdDisplay userId={userId} />);

    const container = screen.getByTestId('login-id-display');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('p-6');
    expect(container).toHaveClass('border');
    expect(container).toHaveClass('border-indigo-200');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('shadow-md');
    expect(container).toHaveClass('bg-white');
    expect(container).toHaveClass('text-center');

    const label = screen.getByText('あなたのログインIDは');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('text-lg');
    expect(label).toHaveClass('text-gray-600');
    expect(label).toHaveClass('mb-2');

    const idValue = screen.getByText(`ログインID: ${userId}`);
    expect(idValue).toBeInTheDocument();
    expect(idValue).toHaveClass('text-xl');
    expect(idValue).toHaveClass('font-semibold');
    expect(idValue).toHaveClass('text-indigo-700');
  });
});
