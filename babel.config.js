'use strict';

/**
 * Babel configuration — used by Jest to transpile frontend ES modules.
 * The backend (Node 18+) runs native CommonJS and does NOT use Babel.
 * Only public/tests/** files are transpiled via babel-jest.
 */
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
      },
    ],
  ],
};