'use strict';

/**
 * Questions Controller
 *
 * Responsibility: orchestrate the request lifecycle for /api/questions.
 *   1. Validate input (delegates to validation utility)
 *   2. Call the AI service
 *   3. Return a clean response
 *   4. Pass errors to the centralized error handler
 *
 * The controller knows about HTTP req/res but does NOT contain business logic.
 * Business logic lives in services/. Validation logic lives in utils/.
 */

const { validateJobTitle } = require('../utils/validation');
const geminiService = require('../services/gemini');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/questions
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function generateQuestions(req, res, next) {
  try {
    // 1. Validate input
    const validation = validateJobTitle(req.body.jobTitle);

    if (!validation.valid) {
      throw new AppError(validation.error, 400);
    }

    const { sanitized: jobTitle } = validation;

    logger.info('Generating questions', { jobTitle });

    // 2. Call the AI service
    const questions = await geminiService.generateQuestions(jobTitle);

    // 3. Respond with the structured result
    res.status(200).json({ questions });
  } catch (err) {
    // Pass all errors — both AppError and unexpected — to the central handler
    next(err);
  }
}

module.exports = { generateQuestions };