"use client";

import React from 'react';
import { LoginIdDisplay } from '@/components/LoginIdDisplay';

export default function Home() {
  // 実際のアプリケーションでは、ここにログインIDを取得するロジックが入ります。
  // 今回は仮のIDを表示します。
  const exampleUserId = 'user12345';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">🚀 AI自動開発システム基盤</h1>
        <p className="text-lg text-gray-800">Next.js + TypeScript の環境構築が正常に完了しました！</p>
        <p className="text-md text-gray-600 mt-1">Notionからタスクを起票すると、ここにAIが画面を自動生成します。</p>
      </div>
      <div className="w-full max-w-md">
        <LoginIdDisplay userId={exampleUserId} />
      </div>
    </main>
  );
}
