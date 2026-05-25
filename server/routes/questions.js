'use strict';

/**
 * Questions Router
 *
 * Responsibility: define the route shape and delegate to the controller.
 * Keeps route definitions thin — no logic lives here.
 */

const express = require('express');
const { generateQuestions } = require('../controllers/questionsController');

const router = express.Router();

// POST /api/questions
router.post('/questions', generateQuestions);

module.exports = router;