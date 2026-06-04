// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.url,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 💡 Geminiに型安全を強制する厳格なルール
      "@typescript-eslint/no-explicit-any": "error", // any型があればビルド・Lintをエラーにする
      "no-console": "warn",                         // console.logの消し忘れ防止
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"], // 型定義はinterfaceに統一
    }
  }
];
