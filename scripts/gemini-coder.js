// scripts/gemini-coder.js
const fs = require('fs');
const path = require('path'); 
const { GoogleGenAI, Type } = require('@google/genai');

// 大文字の Class constructor に対して、必ず「new」を付与してインスタンス化します
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 一時的な503や429エラーを回避するためのウェイト（待機）関数
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  // 1. Notionから落としてきたタスク情報を読み込む
  if (!fs.existsSync('./task_info.json')) {
    console.error("❌ task_info.json が見つかりません。処理を中断します。");
    process.exit(1);
  }
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  
  const requirement = taskInfo.description || taskInfo.SPECIFICATION || "仕様が定義されていません。";
  const taskId = taskInfo.TASK_ID;

  console.log(`🤖 タスク [${taskId}] のTypeScriptコード生成を開始します...`);

  // 1.5. GitHub Actionsが作成したメインブランチ（main）のコンテキストを読み込み
  let mainContext = "既存のコード資産はありません（完全な新規開発プロジェクトです）。";
  if (fs.existsSync('main_context.txt')) {
    mainContext = fs.readFileSync('main_context.txt', 'utf8');
    console.log("📂 メインブランチの既存ソースコード文脈（ファイル構成・中身）を読み込みました。");
  } else {
    console.log("⚠️ main_context.txt がないため、新規作成として振る舞います。");
  }

  // 2. 要件プロンプトの作成
  const prompt = `
以下の【既存のメインブランチ（main）のコード状況】を完全に把握し、不必要な重複を避け、既存の設計思想や共通設定（レイアウトや既存コンポーネント）に完璧に適合するコードを作成してください。

【既存のメインブランチ（main）のコード状況】:
${mainContext}

【実装すべき新しいタスクの仕様】:
${requirement}
  `;

  console.log("🧠 Gemini にプロンプトを送信中...（思考中）");

  // 3. 💡【堅牢化のさらなる強化】最大5回、かつ段階的に待機時間を延ばすステップバックオフ・リトライ
  let response;
  let maxRetries = 5; // 💡 3回から5回に増やして粘り強くします
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          systemInstruction: `
          あなたは厳格なフロントエンドテックリードです。
          生成するTypeScriptコードは、以下の【絶対厳守コーディングルール】に必ず従ってください。

          【絶対厳守コーディングルール】:
          1. 既存コードの尊重:
             - 提供された「既存のメインブランチのコード状況」を壊したり、同様の機能を二重実装したりしないこと。
             - プロジェクト全体のデザインや設定（package.jsonに記載されたライブラリ等）と完全に調和させること。
          2. 命名規則:
             - 今回生成するファイルはNext.jsのページ用（page.tsx）となるため、コンポーネント関数名は必ず「PascalCase」（例: export default function TaskPage()）で記述すること。
             - 関数、変数、プロパティ名は「camelCase」（例: getUserData）とする。
          3. 型定義（TypeScript）:
             - 「any」型の使用は一切禁止する。必ず厳格にインターフェース（interface）や型（type）を定義すること。
             - Next.jsのコンポーネントには「React.FC」は使用せず、通常の関数宣言型（export default function Page() {}）で記述すること。
          4. UI・スタイリング:
             - スタイリングには必ず Tailwind CSS のクラスのみを使用すること。インラインスタイル（style={{...}}）は禁止。
             - レスポンシブ対応（md:, lg:）を意識したレイアウトにすること。
          5. ディレクトリ構成・インポート:
             - 外部コンポーネントやユーティリティをインポートする際は、相対パス（../../）ではなく、必ずパスエイリアス（@/components/...）を使用すること。
             - このファイルは直接ブラウザから閲覧されるページとなるため、最上部に必ず '"use client";' を付与してクライアントコンポーネントとして動作させること。
             - ソースコード、およびテストコード内（.test.tsx）において、Node.jsスタイルの「require()」によるインポートは一切禁止とする。外部モジュールや標準ライブラリ（fs, path等）の読み込みは、必ずTypeScript標準の「import ... from ...」構文を使用すること。
             - Next.jsのビルド仕様に基づき、ファイル内で「useSearchParams()」を使用する場合は、必ず該当するコンポーネントまたは呼び出し箇所を React の「<Suspense>」コンポーネント（import { Suspense } from 'react';）で適切にラップして囲むこと。
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

      // 成功したらループを抜ける
      break; 
    } catch (error) {
      attempt++;
      console.warn(`⚠️ Gemini APIが一時的に不安定です（試行 ${attempt}/${maxRetries}）: ${error.message}`);
      
      if (attempt >= maxRetries) {
        throw error; // 5回すべてダメだった場合はエラーとして終了
      }
      
      // 💡 失敗するごとに「5秒 ➡️ 10秒 ➡️ 15秒 ➡️ 20秒」とサーバーが落ち着くまで待機時間を段階的に伸ばす
      const waitTime = attempt * 5000; 
      console.log(`⏳ サーバーの回復を待つため、${waitTime / 1000}秒後に自動リトライします...`);
      await sleep(waitTime);
    }
  }

  // 4. 返ってきたJSONをパースしてファイルに書き出す
  const result = JSON.parse(response.text.trim());
  
  const pageDir = path.join('src/app', taskId);
  const testDir = 'src/components';

  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  fs.writeFileSync(path.join(pageDir, 'page.tsx'), result.sourceCode, 'utf8');
  fs.writeFileSync(path.join(testDir, `${taskId}.test.tsx`), result.testCode, 'utf8');

  console.log(`✅ コーディングルールに準拠した独立個別ページの生成が完了しました！`);
  console.log(`📂 画面ページ生成先: ${pageDir}/page.tsx`);
  console.log(`📂 テストコード生成先: ${testDir}/${taskId}.test.tsx`);
}

main().catch((err) => {
  console.error('🚨 gemini-coder.js の実行中にエラーが発生しました:', err);
  process.exit(1);
});
