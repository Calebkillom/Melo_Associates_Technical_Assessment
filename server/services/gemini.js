'use strict';

/**
 * HTTP request logging middleware
 *
 * Logs method, path, status, and response time for every request.
 * Lightweight alternative to Morgan for this project's scope.
 * Suppressed in test environment to keep Jest output clean.
 */

const logger = require('../utils/logger');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Hook into the response's 'finish' event so we can log the final status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} — ${duration}ms`);
  });

  next();
}

module.exports = { requestLogger };