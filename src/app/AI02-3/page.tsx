"use client";

import { useSearchParams } from 'next/navigation';

export default function LoginIdPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center md:p-12 lg:p-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:text-4xl lg:text-5xl">
          ログインID
        </h1>
        {userId ? (
          <p className="text-xl text-indigo-600 font-semibold md:text-2xl lg:text-3xl">
            {userId}
          </p>
        ) : (
          <p className="text-lg text-gray-600 md:text-xl">
            ログインIDが指定されていません。
          </p>
        )}
      </div>
    </div>
  );
}