import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (id: string, password: string) => void;
}

export function LoginForm(props: LoginFormProps) {
  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const isLoginButtonEnabled = id.length > 0 && password.length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onLogin(id, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 md:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md lg:max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="ID入力フィールド"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">PASSWORD</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="パスワード入力フィールド"
            />
          </div>
          <button
            type="submit"
            disabled={!isLoginButtonEnabled}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
