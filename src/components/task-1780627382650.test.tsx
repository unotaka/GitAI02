import { render, screen } from '@testing-library/react';
import { LoginIdDisplay } from './LoginIdDisplay';
import { expect, test, describe } from 'vitest';

describe('LoginIdDisplay', () => {
  test('renders the provided user ID', () => {
    const testUserId = 'loggedInUser456';
    render(<LoginIdDisplay userId={testUserId} />);
    
    const userIdElement = screen.getByText(testUserId);
    expect(userIdElement).toBeInTheDocument();
  });

  test('displays a clear label for the user ID', () => {
    const testUserId = 'anotherUser789';
    render(<LoginIdDisplay userId={testUserId} />);

    const labelElement = screen.getByText(/Logged in as:/i);
    expect(labelElement).toBeInTheDocument();
  });

  test('has appropriate styling classes for centering and text presentation', () => {
    const testUserId = 'styledUser';
    const { container } = render(<LoginIdDisplay userId={testUserId} />);
    
    // Check for the presence of Tailwind classes that indicate styling
    const wrapperDiv = container.firstChild;
    expect(wrapperDiv).toHaveClass('p-6');
    expect(wrapperDiv).toHaveClass('bg-white');
    expect(wrapperDiv).toHaveClass('shadow-lg');
    expect(wrapperDiv).toHaveClass('rounded-lg');
    expect(wrapperDiv).toHaveClass('text-center');

    const userIdText = screen.getByText(testUserId);
    expect(userIdText).toHaveClass('text-3xl');
    expect(userIdText).toHaveClass('font-bold');
    expect(userIdText).toHaveClass('text-indigo-600');

    const labelText = screen.getByText(/Logged in as:/i);
    expect(labelText).toHaveClass('text-lg');
    expect(labelText).toHaveClass('text-gray-700');
    expect(labelText).toHaveClass('mb-2');
  });
});
