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
    return;
  }

  const page = data.results[0];
  const pageId = page.id;

  // --- Notionから各種プロパティ（タスクID・仕様）を抽出 ---

  // 💡 【超強化マージ】Notionの『タスクID』がどんな性質（型）であっても100%文字を引っこ抜く
  const idProperty = page.properties['タスクID'] || {};
  let taskId = "";

  if (idProperty.type === 'rich_text' && idProperty.rich_text?.length > 0) {
    // 1. 手動入力のテキスト型の場合
    taskId = idProperty.rich_text[0].plain_text;
  } else if (idProperty.type === 'unique_id' && idProperty.unique_id) {
    // 2. Notion公式の「ID」型（自動発番）の場合（接頭辞 + 番号を結合）
    const prefix = idProperty.unique_id.prefix ? idProperty.unique_id.prefix + '-' : '';
    taskId = prefix + idProperty.unique_id.number;
  } else if (idProperty.type === 'formula' && idProperty.formula) {
    // 3. 他の文字を結合している関数（Formula）型の場合
    taskId = idProperty.formula.string || idProperty.formula.number?.toString() || "";
  } else if (idProperty.type === 'number' && idProperty.number !== undefined) {
    // 4. 単純な数値型の場合
    taskId = idProperty.number.toString();
  } else if (idProperty.type === 'title' && idProperty.title?.length > 0) {
    // 5. 万が一タイトル（名前）属性に指定されていた場合
    taskId = idProperty.title[0].plain_text;
  }

  // 前後の余計な空白を綺麗にカット
  if (taskId) {
    taskId = taskId.trim();
  }

  // 💡 【安全弁】万が一「タスクID」のプロパティがNotion側で空っぽだった場合のフォールバック
  if (!taskId) {
    const titleProperty = page.properties['名前'] || page.properties['Name'] || {};
    const pageTitle = titleProperty.title?.[0]?.plain_text || '';
    
    if (pageTitle) {
      // タイトルが取れればそれを使用
      taskId = pageTitle.trim();
    } else {
      // 最終手段としてタイムスタンプ
      taskId = `task-${Date.now()}`;
    }
    console.log(`⚠️ Notionの「タスクID」プロパティが空だったため、代替IDを設定しました: ${taskId}`);
  }

  // 💡 Gitブランチ名として悪影響が出ないよう、空白や禁止文字を排除するクリーンアップ
  taskId = taskId.replace(/[^a-zA-Z0-9-_]/g, '');

  // 2. 仕様（Notionのテキスト、またはリッチテキストプロパティ）
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
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `TASK_ID=${taskId}\n`, 'utf8');
    console.log(`🚀 GITHUB_ENV に TASK_ID=${taskId} を登録しました。`);
  }
}

checkNotionDatabase().catch((err) => {
  console.error('🚨 予期せぬエラーが発生しました:', err);
  process.exit(1);
});
