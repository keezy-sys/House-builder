export default [
  {
    ignores: ["node_modules/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        FileReader: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
];
