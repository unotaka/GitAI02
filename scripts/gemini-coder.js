// scripts/gemini-coder.js
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

// Gemini APIの初期化（GitHub Actionsのシークレットから渡される）
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  // 1. Notionから落としてきたタスク情報を読み込む
  const taskInfo = JSON.parse(fs.readFileSync('./task_info.json', 'utf8'));
  const requirement = taskInfo.description; // 仕様書の本文
  const taskId = taskInfo.TASK_ID;

  console.log(`🤖 タスク [${taskId}] のコード生成を開始します...`);

  // 2. Geminiへのプロンプト作成（成果物をJSONで確定させるのがコツ）
  const prompt = `
  あなたはシニアTypeScriptエンジニアです。以下の【仕様】に従って、Next.js (App Router) のコンポーネントと、そのVitest用テストコードを生成してください。

  【仕様】:
  ${requirement}

  【出力フォーマット】:
  必ず以下の構成のJSONフォーマットのみで返答してください。余計な解説やMarkdownの枠（\`\`\`json等）は一切含めないでください。

  {
    "sourceCode": "ここにNext.jsのコンポーネントコード（TypeScript）を記述。ファイルパスは src/app/components/${taskId}.tsx とします。",
    "testCode": "ここにsrc/app/components/${taskId}.tsxに対するVitestのテストコードを記述。"
  }
  `;

  // 3. Gemini APIの呼び出し (2026年現在の推奨モデル gemini-2.5-flash を使用)
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // 4. 返ってきたJSONをパースしてファイルに書き出す
  const result = JSON.parse(response.text.trim());
  
  // ディレクトリがなければ作成
  fs.mkdirSync('src/app/components', { recursive: true });

  fs.writeFileSync(`src/app/components/${taskId}.tsx`, result.sourceCode);
  fs.writeFileSync(`src/app/components/${taskId}.test.tsx`, result.testCode);

  console.log('✅ ソースコードとテストコードの生成が完了しました！');
}

main().catch(console.error);
