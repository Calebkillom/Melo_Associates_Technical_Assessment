'use strict';

/**
 * Environment configuration and validation
 *
 * This module is the single source of truth for all environment variables.
 * It runs at startup and throws immediately if required config is missing,
 * so the app fails fast with a clear error rather than silently misbehaving.
 */

require('dotenv').config();

/**
 * Validates that all required environment variables are present.
 * Throws a descriptive error listing every missing variable.
 *
 * @throws {Error} If any required variable is missing
 */
function validateEnv() {
  const required = ['GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Copy .env.example to .env and fill in the required values.'
    );
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY,
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = { config, validateEnv };