module.exports = {
  extends: ["next/core-web-vitals", "plugin:prettier/recommended"],
  plugins: ["simple-import-sort", "unused-imports"],
  rules: {
    "react-hooks/exhaustive-deps": "warn",
    "unused-imports/no-unused-imports": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "no-console": ["error", { allow: ["warn", "error"] }],
  },
};