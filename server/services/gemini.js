'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/env');
const logger = require('../utils/logger');

const MODEL_NAME = 'gemini-1.5-flash';
const EXPECTED_QUESTION_COUNT = 3;

function buildPrompt(jobTitle) {
  return `
You are an expert technical recruiter and hiring consultant with 15 years of experience.

Your task: Generate exactly ${EXPECTED_QUESTION_COUNT} thoughtful, role-specific interview questions for the position of "${jobTitle}".

Rules you MUST follow:
1. Return EXACTLY ${EXPECTED_QUESTION_COUNT} questions — no more, no fewer.
2. Each question must be directly relevant to the "${jobTitle}" role.
3. Cover different dimensions: technical/domain skills, behavioural, and situational judgment.
4. Avoid generic questions like "Tell me about yourself" or "Where do you see yourself in 5 years".
5. Each question must be concise — one or two sentences maximum.
6. Output ONLY the numbered list. No preamble, no explanation, no closing remarks.
7. Format EXACTLY like this:
   1. [Question one]
   2. [Question two]
   3. [Question three]

Generate ${EXPECTED_QUESTION_COUNT} interview questions for a "${jobTitle}" now.
  `.trim();
}

function parseQuestions(rawText) {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const questions = lines
    .filter((line) => /^\d+[\.\)\-]\s+\S/.test(line))
    .map((line) => line.replace(/^\d+[\.\)\-]\s*/, '').trim());

  if (questions.length >= EXPECTED_QUESTION_COUNT) {
    return questions.slice(0, EXPECTED_QUESTION_COUNT);
  }

  logger.warn('Numbered list parsing yielded fewer than expected questions; using fallback', {
    found: questions.length,
    raw: rawText.slice(0, 200),
  });

  const fallback = lines.slice(0, EXPECTED_QUESTION_COUNT);

  if (fallback.length < EXPECTED_QUESTION_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_QUESTION_COUNT} questions but could only parse ${fallback.length}.`
    );
  }

  return fallback;
}

async function generateQuestions(jobTitle) {
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = buildPrompt(jobTitle);

  logger.info('Calling Gemini API', { jobTitle, model: MODEL_NAME });

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Gemini returned an empty response.');
  }

  logger.debug('Gemini raw response received', { chars: rawText.length });

  const questions = parseQuestions(rawText);

  logger.info('Questions parsed successfully', { count: questions.length });

  return questions;
}

module.exports = { generateQuestions, buildPrompt, parseQuestions };