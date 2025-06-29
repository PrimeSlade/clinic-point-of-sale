// eslint.config.js
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      // Custom rules (if any)
      // Example: '@typescript-eslint/no-unused-vars': 'warn',
      "prettier/prettier": "warn",
    },
  },
];
