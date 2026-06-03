// scripts/gemini-fixer.js
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  const taskId = taskInfo.TASK_ID;

  // 現在のソース、テスト、そして失敗したエラーログを読み込む
  const currentSource = fs.readFileSync(`src/app/components/${taskId}.tsx`, 'utf8');
  const currentTest = fs.readFileSync(`src/app/components/${taskId}.test.tsx`, 'utf8');
  const errorLog = fs.readFileSync('./test_result.log', 'utf8');

  console.log('🤖 テストエラーを検知しました。Geminiによる自律修正を開始します...');

  // エラーログが長すぎる場合は直近の100行にトリミング（トークン節約と精度向上のため）
  const trimmedLog = errorLog.split('\n').slice(-100).join('\n');

  const prompt = `
  あなたが生成したコードの自動テスト（Vitest）が失敗しました。
  以下の【エラーログ】を分析し、【現在のソースコード】または【現在のテストコード】のバグを修正してください。

  【現在のソースコード】:
  ${currentSource}

  【現在のテストコード】:
  ${currentTest}

  【エラーログ】:
  ${trimmedLog}

  【出力フォーマット】:
  修正後のコードを、必ず以下のJSONフォーマットのみで返答してください。
  {
    "sourceCode": "修正後のソースコード全体",
    "testCode": "修正後のテストコード全体"
  }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const result = JSON.parse(response.text.trim());

  // ファイルを上書き（これで次のループの pnpm test で再検証される）
  fs.writeFileSync(`src/app/components/${taskId}.tsx`, result.sourceCode);
  fs.writeFileSync(`src/app/components/${taskId}.test.tsx`, result.testCode);

  console.log('🔄 コードの修正が完了しました。再テストを実行します。');
}

main().catch(console.error);
