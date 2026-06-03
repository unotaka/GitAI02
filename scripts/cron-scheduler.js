// scripts/cron-scheduler.js
const fs = require('fs');

async function checkNotionDatabase() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    console.error('🚨 エラー: NOTION_TOKEN または NOTION_DATABASE_ID が環境変数に設定されていません。');
    process.exit(1);
  }

  console.log('🔍 Notion データベースのポーリングを開始します...');

  // Notion API を叩いて「ステータス」が「Claude生成待ち」のタスクを1件だけ取得
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: 'ステータス',
        status: {
          equals: 'Claude生成待ち'
        }
      },
      page_size: 1 // 1回につき1タスクずつ確実に処理する
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`🚨 Notion API エラー: ${response.status}`, errorText);
    process.exit(1);
  }

  const data = await response.json();

  // 対象のタスクがない場合
  if (!data.results || data.results.length === 0) {
    console.log('🎵 「Claude生成待ち」のタスクは見つかりませんでした。ワークフローを終了します。');
    // 後続のステップが動かないよう、TASK_ID を空のまま終了
    return;
  }

  const page = data.results[0];
  const pageId = page.id;

  // --- Notionから各種プロパティ（タイトル・仕様）を抽出 ---
  // 1. タスクID（Notionのタイトルプロパティを想定。例：「task-001」などの文字列）
  const titleProperty = page.properties['名前'] || page.properties['Name'] || {};
  const taskId = titleProperty.title?.[0]?.plain_text || `task-${Date.now()}`;

  // 2. 仕様（Notionのテキスト、またはリッチテキストプロパティ。ここでは「仕様」という名前のテキストプロパティを想定）
  // ※もしプロパティ名が違う場合は、ご自身のNotionに合わせて「仕様」の部分を書き換えてください。
  const descProperty = page.properties['仕様'] || {};
  const description = descProperty.rich_text?.[0]?.plain_text || '仕様が記載されていません。';

  console.log(`📌 タスクを発見しました！ ID: ${taskId}`);

  // 3. 後続の Gemini（gemini-coder.js）が読み込むための共通JSONファイルを書き出し
  const taskInfo = {
    PAGE_ID: pageId,
    TASK_ID: taskId,
    description: description
  };

  fs.writeFileSync('./task_info.json', JSON.stringify(taskInfo, null, 2), 'utf8');
  console.log('💾 task_info.json を正常に保存しました。');

  // 4. GitHub Actionsの「環境変数」として TASK_ID を登録する
  // 💡 GitHub Actionsの仕様上、GITHUB_ENV という特殊なファイルに書き込むことで、
  // 以降のステップ（if: env.TASK_ID != ''）が正常に機能するようになります。
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `TASK_ID=${taskId}\n`, 'utf8');
    console.log(`🚀 GITHUB_ENV に TASK_ID=${taskId} を登録しました。`);
  }
}

checkNotionDatabase().catch((err) => {
  console.error('🚨 予期せぬエラーが発生しました:', err);
  process.exit(1);
});
