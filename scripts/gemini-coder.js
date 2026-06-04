// scripts/gemini-coder.js
const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');

// 💡 修正点：大文字の Class constructor に対して、必ず「new」を付与してインスタンス化します
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  // 1. Notionから落としてきたタスク情報を読み込む
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  const requirement = taskInfo.description; // 仕様書の本文
  const taskId = taskInfo.TASK_ID;

  console.log(`🤖 タスク [${taskId}] のTypeScriptコード生成を開始します...`);

  // 2. 要件プロンプトの作成
  const prompt = `
  以下の【仕様】に従って、Next.js (App Router) で動作するコンポーネントとテストコードを生成してください。

  【仕様】:
  ${requirement}
  `;

  // 3. Gemini APIの呼び出し（システム指示とスキーマによるコーディングルールの強制）
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: `
      あなたは厳格なフロントエンドテックリードです。
      生成するTypeScriptコードは、以下の【絶対厳守コーディングルール】に必ず従ってください。

      【絶対厳守コーディングルール】:
      1. 命名規則:
         - コンポーネント名、ファイル名は必ず「PascalCase」（例: UserProfile）とする。
         - 関数、変数、プロパティ名は「camelCase」（例: getUserData）とする。
      2. 型定義（TypeScript）:
         - 「any」型の使用は一切禁止する。必ず厳格にインターフェース（interface）や型（type）を定義すること。
         - Next.jsのコンポーネントには「React.FC」は使用せず、通常の関数宣言型（export function Component() {}）で記述すること。
      3. UI・スタイリング:
         - スタイリングには必ず Tailwind CSS のクラスのみを使用すること。インラインスタイル（style={{...}}）は禁止。
         - レスポンシブ対応（md:, lg:）を意識したレイアウトにすること。
      4. ディレクトリ構成・インポート:
         - 外部コンポーネントやユーティリティをインポートする際は、相対パス（../../）ではなく、必ずパスエイリアス（@/components/...）を使用すること。
      `,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sourceCode: {
            type: Type.STRING,
            description: "Next.js (App Router) のTypeScriptコード（.tsx）。上記のコーディングルールをすべて満たしていること。"
          },
          testCode: {
            type: Type.STRING,
            description: "上記のコンポーネントに対するVitest＋Testing Libraryを用いたテストコード。正常系・異常系を網羅し、最新の構文で記述すること。"
          }
        },
        required: ["sourceCode", "testCode"]
      }
    }
  });

  // 4. 返ってきたJSONをパースしてファイルに書き出す
  const result = JSON.parse(response.text.trim());
  
  const targetDir = 'src/components';
  fs.mkdirSync(targetDir, { recursive: true });

  fs.writeFileSync(`${targetDir}/${taskId}.tsx`, result.sourceCode, 'utf8');
  fs.writeFileSync(`${targetDir}/${taskId}.test.tsx`, result.testCode, 'utf8');

  console.log(`✅ コーディングルールに準拠したソースコードとテストコードの生成が完了しました！`);
  console.log(`📂 生成先: ${targetDir}/${taskId}.tsx`);
  console.log(`📂 生成先: ${targetDir}/${taskId}.test.tsx`);
}

main().catch((err) => {
  console.error('🚨 gemini-coder.js の実行中にエラーが発生しました:', err);
  process.exit(1);
});
