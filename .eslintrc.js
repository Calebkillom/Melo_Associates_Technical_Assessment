'use strict';

/**
 * ESLint configuration
 *
 * Uses eslint-config-prettier to disable all formatting rules that
 * conflict with Prettier, so both tools work in harmony.
 * eslint-plugin-node enforces Node.js best practices on server code.
 * eslint-plugin-jest enforces test best practices in test files.
 */
module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier', // Must be LAST — disables ESLint rules that clash with Prettier
  ],
  plugins: ['jest'],
  rules: {
    // ---- Code quality ----
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',

    // ---- Async / await ----
    'no-return-await': 'error',
    'require-await': 'error',

    // ---- Console ----
    // Allow console in server files only (see overrides below)
    'no-console': 'error',

    // ---- Node plugin — relax version detection ----
    'node/no-unsupported-features/es-syntax': 'off',
    'node/no-missing-require': 'error',
    'node/no-extraneous-require': 'error',

    // ---- Returns ----
    'consistent-return': 'error',
  },
  overrides: [
    // ---- Server files: allow intentional console logging ----
    {
      files: ['server/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    // ---- Test files: relax rules that conflict with Jest patterns ----
    {
      files: ['**/*.test.js', '**/tests/**/*.js', '**/setup.js'],
      env: {
        'jest/globals': true,
        browser: true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'no-console': 'off',
        'require-await': 'off',
        'consistent-return': 'off',
        'node/no-unpublished-require': 'off',
        'node/no-extraneous-require': 'off',
      },
    },
    // ---- Frontend JS files: browser globals ----
    {
      files: ['public/js/**/*.js'],
      env: {
        browser: true,
        node: false,
      },
      rules: {
        'node/no-missing-require': 'off',
        'node/no-extraneous-require': 'off',
        'node/no-unsupported-features/es-builtins': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/'],
};