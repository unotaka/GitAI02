"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

/**
 * AI02-4Content Component
 * 検索パラメータからIDを取得し、画面中央に表示します。
 * IDが存在しない場合は、その旨を通知します。
 */
function AI02-4Content(): JSX.Element {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center md:p-12 lg:p-16 w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-6 md:text-4xl lg:text-5xl text-gray-800 dark:text-white">
          ログインID表示
        </h1>
        {id ? (
          <p className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 break-words md:text-6xl lg:text-7xl leading-tight">
            {id}
          </p>
        ) : (
          <p className="text-xl text-red-500 dark:text-red-400 md:text-2xl lg:text-3xl font-medium">
            IDが見つかりませんでした。
          </p>
        )}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400 md:text-base">
          これは、ログイン時に使用されたIDです。
        </p>
      </div>
    </div>
  );
}

/**
 * AI02-4Page Component
 * useSearchParamsを使用するAI02-4Contentコンポーネントを
 * Suspenseでラップしてエクスポートします。
 */
export default function AI02-4Page(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-2xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">
          IDを読み込み中...
        </div>
      }
    >
      <AI02-4Content />
    </Suspense>
  );
}