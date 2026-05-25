'use strict';

/**
 * Prettier configuration
 *
 * These settings define the canonical code style for this project.
 * Run `npm run format` to apply these rules to all files.
 * Run `npm run format:check` in CI to verify formatting without writing.
 *
 * Why these choices:
 *   singleQuote: true      → Standard JS community convention (matches ESLint)
 *   semi: true             → Explicit semicolons prevent ASI bugs
 *   trailingComma: 'es5'   → Cleaner git diffs; valid in ES5+ contexts
 *   printWidth: 90         → Slightly wider than default; readable on split screens
 *   tabWidth: 2            → Universal JS community standard
 */
module.exports = {
  singleQuote: true,
  semi: true,
  trailingComma: 'es5',
  printWidth: 90,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'css',
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
  ],
};