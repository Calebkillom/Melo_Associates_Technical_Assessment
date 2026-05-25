'use strict';

/**
 * Centralized error handling middleware
 *
 * Express error handlers receive 4 arguments: (err, req, res, next).
 * This must be the LAST middleware registered in server.js.
 *
 * All unhandled errors from route handlers bubble up here.
 * This ensures consistent error response shape across the entire API.
 */

const logger = require('../utils/logger');

/**
 * Custom application error class.
 * Use this when you want to throw an error with a specific HTTP status code.
 *
 * Example:
 *   throw new AppError('Resource not found', 404);
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code to send
   */
  constructor(message, statusCode) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error-handling middleware.
 * Catches all errors thrown or passed via next(err) in route handlers.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next - Required 4th param for Express to recognise as error handler
 */
function errorHandler(err, req, res, _next) {
  // Determine the appropriate status code
  const statusCode = err.statusCode || 500;

  // Log the full error server-side (never expose stack to client)
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    statusCode,
    stack: err.stack,
  });

  // Send a clean, frontend-friendly response
  res.status(statusCode).json({
    error:
      statusCode >= 500
        ? 'An internal server error occurred. Please try again.' // Hide internals in 5xx
        : err.message,
  });
}

module.exports = { errorHandler, AppError };