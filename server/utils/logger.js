'use strict';

/**
 * Lightweight structured logger
 *
 * Wraps console methods with a consistent format:
 *   [LEVEL] [timestamp] message  { optional metadata }
 *
 * In test environments, all output is suppressed to keep Jest output clean.
 * Replace this with Winston or Pino when scaling to production.
 */

const { config } = require('../config/env');

const isTest = config.isTest || process.env.NODE_ENV === 'test';

/**
 * Formats a log line. Keeps it minimal — timestamp + level + message.
 * @param {string} level
 * @param {string} message
 * @param {object} [meta]
 * @returns {string}
 */
function format(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${level}] [${ts}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

const logger = {
  info: (message, meta) => {
    if (!isTest) console.log(format('INFO ', message, meta));
  },
  warn: (message, meta) => {
    if (!isTest) console.warn(format('WARN ', message, meta));
  },
  error: (message, meta) => {
    if (!isTest) console.error(format('ERROR', message, meta));
  },
  debug: (message, meta) => {
    if (!isTest && config.isDevelopment) console.log(format('DEBUG', message, meta));
  },
};

module.exports = logger;