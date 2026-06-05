"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormState {
  id: string;
  passwordHash: string;
}

export default function LoginPage(): JSX.Element {
  const [formData, setFormData] = useState<LoginFormState>({
    id: '',
    passwordHash: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // 仮のログインロジック
    // 実際のアプリケーションでは、IDとPASSWORDをバックエンドに送信し、認証を行う
    if (formData.id === 'testuser' && formData.passwordHash === 'password') {
      // ログイン成功
      router.push(`/AI02-3?id=${formData.id}`);
    } else {
      // ログイン失敗
      setError('IDまたはパスワードが正しくありません。');
    }
  };

  const isFormValid = formData.id.trim() !== '' && formData.passwordHash.trim() !== '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center md:p-12 lg:p-16 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-8 md:text-4xl lg:text-5xl text-gray-800 dark:text-white">
          ログイン
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="id" className="sr-only">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              placeholder="ID"
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              aria-label="ID入力フィールド"
            />
          </div>
          <div>
            <label htmlFor="passwordHash" className="sr-only">パスワード</label>
            <input
              type="password"
              id="passwordHash"
              name="passwordHash"
              value={formData.passwordHash}
              onChange={handleInputChange}
              placeholder="パスワード"
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm md:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              aria-label="パスワード入力フィールド"
            />
          </div>
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm md:text-base" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition-colors duration-200\n              ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' : 'bg-indigo-400 dark:bg-indigo-500 cursor-not-allowed opacity-70'}`}
          >
            Login
          </button>
        </form>
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 md:text-base">
          テストアカウント: ID: testuser, パスワード: password
        </p>
      </div>
    </div>
  );
}