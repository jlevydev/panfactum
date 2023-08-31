module.exports = {
    extends: [
        'eslint:recommended',
        "standard",
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react'],
    rules: {
      indent: ["error", 2],
      "no-void": "off",
      "camelcase": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          "checksVoidReturn": false
        }
      ],
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_$"
      }],
      "react/jsx-max-props-per-line": ["warn", {"maximum": 1, "when": "always"}],
      "react/jsx-first-prop-new-line": ["warn", "multiline"],
      "react/jsx-closing-tag-location": ["warn", true],
      "react/jsx-closing-bracket-location": ["warn", "tag-aligned"],
      "react/self-closing-comp": ["warn", {"component": true, "html": true}],
      "react/jsx-one-expression-per-line": ["warn", {"allow": "literal"}],
      "react/jsx-indent": ["error", 2, {checkAttributes: true, indentLogicalExpressions: true}]
    },
    overrides: [{
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json']
      }
    }]
};
