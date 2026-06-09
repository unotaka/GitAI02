// scripts/gemini-fixer.js
const fs = require('fs');
const path = require('path');
const { GoogleGenAI, Type } = require('@google/genai');

// 大文字の Class constructor に対して、必ず「new」を付与してインスタンス化します
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  const taskId = taskInfo.TASK_ID;

  // 💡 【同期修正】coder.js側の保存先（App Router 構造）と完全に一致させます
  const sourcePath = path.join('src/app', taskId, 'page.tsx');
  const testPath = path.join('src/components', `${taskId}.test.tsx`);

  if (!fs.existsSync(sourcePath) || !fs.existsSync(testPath)) {
    console.error(`🚨 エラー: 修正対象のファイルが見つかりません。(${sourcePath} または ${testPath})`);
    process.exit(1);
  }

  const currentSource = fs.readFileSync(sourcePath, 'utf8');
  const currentTest = fs.readFileSync(testPath, 'utf8');
  const errorLog = fs.readFileSync('./test_result.log', 'utf8');

  console.log(`🤖 タスク [${taskId}] のエラーを検知しました。Geminiによる自律修正を開始します...`);

  const trimmedLog = errorLog.split('\n').slice(-120).join('\n');

  const prompt = `
  あなたが生成したコードにおいて、コーディングルールチェック（ESLint）または自動テスト（Vitest）が失敗しました。
  以下の【エラーログ】を徹底的に分析し、【現在のソースコード】または【現在のテストコード】のバグを修正してください。

  【現在のソースコード】:
  ${currentSource}

  【現在のテストコード】:
  ${currentTest}

  【エラーログ】:
  ${trimmedLog}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: `
      あなたは厳格なフロントエンドテックリードです。
      提示されたエラーログ（Lintエラー、またはテストフェイル）を完璧に修正したTypeScriptコードを出力してください。
      修正にあたっては、以下の【絶対厳守コーディングルール】を必ず維持してください。

      【絶対厳守コーディングルール】:
      1. 「any」型の使用は一切禁止（ESLintの最重要ルール）。適切な型またはインターフェースを定義すること。
      2. スタイリングは Tailwind CSS のみを使用し、インラインスタイルは禁止。
      3. Next.jsのコンポーネントには「React.FC」は使用せず、通常の関数宣言型で最上部に '"use client";' を付与して記述すること。
      4. インポートの際はパスエイリアス（@/components/...）を使用すること。
      5. エラーの原因が「テストコード側の不備」である場合は、テストコード側を適切に修正すること。
      6. Node.jsスタイルの「require()」によるインポートは一切禁止とする。必ず「import ... from ...」構文を使用すること。
      `,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sourceCode: {
            type: Type.STRING,
            description: "修正・最適化を施した Next.js (App Router) のTypeScriptコード（page.tsx）。最上部に '\"use client\";' が含まれ、export default function を持つこと。"
          },
          testCode: {
            type: Type.STRING,
            description: "修正・最適化を施した Vitest のテストコード。最上部でrequire()を使わず、すべてimport文で記述すること。"
          }
        },
        required: ["sourceCode", "testCode"]
      }
    }
  });

  const result = JSON.parse(response.text.trim());

  fs.writeFileSync(sourcePath, result.sourceCode, 'utf8');
  fs.writeFileSync(testPath, result.testCode, 'utf8');

  console.log('🔄 コードの自律修正が完了しました。リトライテストを実行します。');
}

main().catch((err) => {
  console.error('🚨 gemini-fixer.js の実行中にエラーが発生しました:', err);
  process.exit(1);
});
