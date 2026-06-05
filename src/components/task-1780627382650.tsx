import { LoginIdDisplay } from "@/components/LoginIdDisplay";

export default function Home() {
  // 実際のアプリケーションでは、ここにログインIDを取得するロジックが入ります。
  // 今回は仮のIDを表示します。
  const currentUserId = "testUser123";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50">
      <LoginIdDisplay userId={currentUserId} />
    </main>
  );
}
