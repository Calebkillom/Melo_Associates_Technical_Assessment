'use strict';

/**
 * Express Application Entry Point
 *
 * Startup order matters:
 *   1. Validate environment (fail fast if API key missing)
 *   2. Register middleware (order is significant in Express)
 *   3. Register routes
 *   4. Register error handler (must be last)
 *   5. Start listening
 *
 * The app object is exported separately from the listen() call so that
 * Supertest can import the app in tests without binding to a port.
 */

const { validateEnv, config } = require('./config/env');

// Fail fast if required env vars are missing — before any other imports
validateEnv();

const express = require('express');
const path = require('path');
const cors = require('cors');

const questionRoutes = require('./routes/questions');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const app = express();

// ---- Middleware (registration order matters) ----
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- API Routes ----
app.use('/api', questionRoutes);

// ---- SPA Fallback: serve index.html for any non-API GET ----
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ---- Centralized Error Handler (must be registered last) ----
app.use(errorHandler);

// ---- Export app for Supertest (does not bind to a port) ----
module.exports = app;

// ---- Only start listening when this file is run directly ----
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`Server running at http://localhost:${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Gemini API key: ${config.geminiApiKey ? 'loaded ✓' : 'MISSING ✗'}`);
  });
}