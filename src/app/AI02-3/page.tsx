"use client";

import React from 'react';

// ログインIDは通常、認証コンテキスト、URLパラメータ、
// またはAPI呼び出しから取得されますが、
// このタスクでは例としてハードコードします。
const USER_ID: string = "user-12345";

export default function LoginIdDisplayPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          ログインID
        </h1>
        <p className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-600 tracking-tight">
          {USER_ID}
        </p>
        <p className="mt-6 text-gray-600 text-sm sm:text-base">
          このIDは、ログイン時に使用されました。
        </p>
      </div>
    </div>
  );
}