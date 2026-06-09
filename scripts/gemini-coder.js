// scripts/gemini-coder.js
const fs = require('fs');
const path = require('path'); 
const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  if (!fs.existsSync('./task_info.json')) {
    console.error("❌ task_info.json が見つかりません。処理を中断します。");
    process.exit(1);
  }
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  
  const requirement = taskInfo.description || taskInfo.SPECIFICATION || "仕様が定義されていません。";
  const taskId = taskInfo.TASK_ID;

  console.log(`🤖 タスク [${taskId}] のTypeScriptコード生成を開始します...`);

  // 💡 【拡張対応】もし前回のコード（すでに一度デプロイされたコード）があれば、それを読み込んで上書き・機能追加のベースにする
  const existingPagePath = path.join('src/app', taskId, 'page.tsx');
  let previousCodeContext = "このタスクの過去の実装コードはまだありません（新規開発です）。";
  if (fs.existsSync(existingPagePath)) {
    previousCodeContext = `このタスクは以前一度実装されています。前回の実装コードは以下の通りです。新しく追加された仕様・変更点を、この既存コードに対して破壊的変更にならないよう、綺麗に機能拡張・マージしてください。\n\n【前回の実装コード】:\n${fs.readFileSync(existingPagePath, 'utf8')}`;
    console.log("🔄 既存の実装コードを検知しました。追加仕様に基づき、差分拡張モードで開発します。");
  }

  let mainContext = "既存のコード資産はありません。";
  if (fs.existsSync('main_context.txt')) {
    mainContext = fs.readFileSync('main_context.txt', 'utf8');
    console.log("📂 メインブランチの全体文脈を読み込みました。");
  }

  const prompt = `
以下の【全体コンテキスト】および【このタスクの過去の実装状況】を踏まえ、新しく追加された【実装すべき新しいタスクの仕様】を満たすように、コードを最適化・機能拡張してください。

【全体コンテキスト】:
${mainContext}

【このタスクの過去の実装状況】:
${previousCodeContext}

【実装すべきタスクの最新仕様（追加仕様含む）】:
${requirement}
  `;

  console.log("🧠 Gemini にプロンプトを送信中...（思考中）");

  let response;
  let maxRetries = 5; 
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `
          あなたは厳格なフロントエンドテックリードです。
          生成するTypeScriptコードは、以下の【絶対厳守コーディングルール】に必ず従ってください。

          【絶対厳守コーディングルール】:
          1. 既存機能の継承: 以前コードが存在している場合は、既存の機能を壊さず、新しい仕様だけを綺麗に追加・拡張すること。
          2. 命名規則: コンポーネント関数名は必ず「PascalCase」（export default function Page()）で記述。関数、変数、プロパティ名は「camelCase」とする。
          3. 型定義（TypeScript）: 「any」型の使用は一切禁止。必ずインターフェースや型を厳格に定義すること。
          4. UI・スタイリング: スタイリングには必ず Tailwind CSS のクラスのみを使用すること。インラインスタイルは禁止。
          5. ディレクトリ構成・インポート: パスエイリアス（@/components/...）を使用すること。最上部に必ず '"use client";' を付与すること。
          6. 【必須】ソースコードおよびテストコード内において、Node.jsスタイルの「require()」によるインポートは一切禁止。必ず「import」を使用すること。
          7. 【必須】ファイル内で「useSearchParams()」を使用する場合は、必ず React の「<Suspense>」コンポーネントで適切にラップして囲むこと。
          `,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sourceCode: {
                type: Type.STRING,
                description: "Next.js (App Router) のページ用TypeScriptコード。最上部に '\"use client\";' が含まれ、export default function を持つこと。"
              },
              testCode: {
                type: Type.STRING,
                description: "上記のコンポーネントに対するVitest＋Testing Libraryを用いたテストコード。最上部でrequire()を使わず、すべてimport文で記述すること。"
              }
            },
            required: ["sourceCode", "testCode"]
          }
        }
      });
      break; 
    } catch (error) {
      attempt++;
      console.warn(`⚠️ Gemini APIが一時的に不安定です（試行 ${attempt}/${maxRetries}）: ${error.message}`);
      if (attempt >= maxRetries) throw error;
      const waitTime = attempt * 5000; 
      await sleep(waitTime);
    }
  }

  const result = JSON.parse(response.text.trim());
  const pageDir = path.join('src/app', taskId);
  const testDir = 'src/components';

  if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  fs.writeFileSync(path.join(pageDir, 'page.tsx'), result.sourceCode, 'utf8');
  fs.writeFileSync(path.join(testDir, `${taskId}.test.tsx`), result.testCode, 'utf8');

  console.log(`✅ 仕様変更・機能拡張に対応した個別ページの生成が完了しました！`);
}

main().catch((err) => {
  console.error('🚨 gemini-coder.js の実行中にエラーが発生しました:', err);
  process.exit(1);
});
