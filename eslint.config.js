import js from "@eslint/js";

export default [
  {
    ignores: ["**/node_modules/", "**/dist/", "**/build/", "**/.next/"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
      },
    },
  },
];
