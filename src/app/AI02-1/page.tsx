"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage(): JSX.Element {
  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!id || !password) {
      alert('IDとPASSWORDを入力してください。');
      return;
    }

    // ここで実際の認証ロジックを呼び出すことを想定
    // 例: const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ id, password }) });
    // 現状はダミー認証
    const isLoginSuccessful = id === 'user' && password === 'password'; // 仮の認証ロジック

    if (isLoginSuccessful) {
      alert('ログイン成功！');
      router.push('/'); // メイン画面へ遷移
    } else {
      alert('IDまたはPASSWORDが間違っています。');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center md:p-12 lg:p-16 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-8 md:text-4xl lg:text-5xl text-gray-800 dark:text-white">
          ログイン
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="id" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-base md:text-lg"
              placeholder="ユーザーIDを入力"
              aria-label="ID入力欄"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-base md:text-lg"
              placeholder="パスワードを入力"
              aria-label="パスワード入力欄"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition duration-150 ease-in-out md:py-4"
            aria-label="ログイン"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}