// eslint.config.js
import globals from "globals";
import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
    }
  },
];
