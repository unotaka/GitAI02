// scripts/gemini-fixer.js
const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');

// 2026年最新SDKの仕様に基づき初期化
const ai = GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  const taskId = taskInfo.TASK_ID;

  // 💡 パスを src/components に統一して読み込み
  const targetDir = 'src/components';
  const sourcePath = `${targetDir}/${taskId}.tsx`;
  const testPath = `${targetDir}/${taskId}.test.tsx`;

  if (!fs.existsSync(sourcePath) || !fs.existsSync(testPath)) {
    console.error(`🚨 エラー: 修正対象のファイルが見つかりません。(${sourcePath} または ${testPath})`);
    process.exit(1);
  }

  // 現在のソース、テスト、そして失敗したエラーログ（Lint または Test の結果）を読み込む
  const currentSource = fs.readFileSync(sourcePath, 'utf8');
  const currentTest = fs.readFileSync(testPath, 'utf8');
  const errorLog = fs.readFileSync('./test_result.log', 'utf8');

  console.log(`🤖 タスク [${taskId}] のエラーを検知しました。Geminiによる自律修正を開始します...`);

  // エラーログが長すぎる場合は直近の120行にトリミング（コンテキストの最適化）
  const trimmedLog = errorLog.split('\n').slice(-120).join('\n');

  // 💡 コーディングルールを再提示し、エラーログの分析を指示するプロンプト
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

  // Gemini APIの呼び出し（システム指示とスキーマによる修正ルールの固定）
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      // 💡 修正時にも絶対にコーディングルールを外さないようテックリードの規約を注入
      systemInstruction: `
      あなたは厳格なフロントエンドテックリードです。
      提示されたエラーログ（Lintエラー、またはテストフェイル）を完璧に修正したTypeScriptコードを出力してください。
      修正にあたっては、以下の【絶対厳守コーディングルール】を必ず維持してください。

      【絶対厳守コーディングルール】:
      1. 「any」型の使用は一切禁止（ESLintの最重要ルール）。適切な型またはインターフェースを定義すること。
      2. スタイリングは Tailwind CSS のみを使用し、インラインスタイルは禁止。
      3. Next.jsのコンポーネントは通常の関数宣言型（export function Component() {}）で記述すること。
      4. インポートの際はパスエイリアス（@/components/...）を使用すること。
      5. エラーの原因が「テストコード側の不備」である場合は、テストコード側を適切に修正すること。
      `,
      responseMimeType: 'application/json',
      // 💡 responseSchema で構造を完全固定し、パースエラーを防止
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sourceCode: {
            type: Type.STRING,
            description: "修正・最適化を施した Next.js (App Router) のTypeScriptコード（.tsx）。ルールに完全準拠していること。"
          },
          testCode: {
            type: Type.STRING,
            description: "修正・最適化を施した Vitest のテストコード。不必要なエラーを起こさないよう、テストロジックを見直すこと。"
          }
        },
        required: ["sourceCode", "testCode"]
      }
    }
  });

  // 返ってきたJSONを安全にパース
  const result = JSON.parse(response.text.trim());

  // 💡 ファイルを上書き（これでGitHub Actionsの次のループで再検証される）
  fs.writeFileSync(sourcePath, result.sourceCode, 'utf8');
  fs.writeFileSync(testPath, result.testCode, 'utf8');

  console.log('🔄 コードの自律修正が完了しました。リトライテストを実行します。');
}

main().catch((err) => {
  console.error('🚨 gemini-fixer.js の実行中にエラーが発生しました:', err);
  process.exit(1);
});
