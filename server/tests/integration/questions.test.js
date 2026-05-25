'use strict';

/**
 * Integration tests: POST /api/questions
 *
 * Uses Supertest to send real HTTP requests to the Express app.
 * The Gemini API is fully mocked at the module level — no real network
 * calls are made. This keeps tests fast, deterministic, and free.
 *
 * Mocking strategy:
 *   jest.mock('@google/generative-ai') replaces the entire module with
 *   a Jest mock. We then configure the mock's return value per test.
 *   Because server.js is imported AFTER the mock is set up, the service
 *   receives the mocked version of GoogleGenerativeAI automatically.
 */

const request = require('supertest');

// ---- Mock the Gemini SDK before importing app ----
jest.mock('@google/generative-ai');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper: configures the mock to resolve with a given text response
function mockGeminiSuccess(text) {
  GoogleGenerativeAI.mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => text },
      }),
    }),
  }));
}

// Helper: configures the mock to reject (simulates API failure)
function mockGeminiFailure(message = 'Gemini API error') {
  GoogleGenerativeAI.mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: jest.fn().mockRejectedValue(new Error(message)),
    }),
  }));
}

// A valid 3-question response that parseQuestions can handle
const VALID_GEMINI_RESPONSE = [
  '1. How do you prioritise customer escalations when handling multiple accounts?',
  '2. Describe a time you used data to identify a customer at risk of churning.',
  '3. How do you collaborate with product teams to advocate for customer needs?',
].join('\n');

// Import app AFTER mocking (order matters!)
let app;
beforeAll(() => {
  process.env.GEMINI_API_KEY = 'test-key-not-real';
  process.env.NODE_ENV = 'test';
  app = require('../../server');
});

afterEach(() => {
  jest.clearAllMocks();
});

// ---- Tests ----

describe('POST /api/questions', () => {
  describe('successful requests', () => {
    beforeEach(() => mockGeminiSuccess(VALID_GEMINI_RESPONSE));

    it('returns HTTP 200 with an array of exactly 3 questions', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Customer Success Manager' });

      expect(res.status).toBe(200);
      expect(res.body.questions).toBeInstanceOf(Array);
      expect(res.body.questions).toHaveLength(3);
    });

    it('response body contains a "questions" key', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Software Engineer' });

      expect(res.body).toHaveProperty('questions');
    });

    it('each question is a non-empty string', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Product Manager' });

      res.body.questions.forEach((q) => {
        expect(typeof q).toBe('string');
        expect(q.length).toBeGreaterThan(0);
      });
    });

    it('returns JSON content-type', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Designer' });

      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  describe('input validation — HTTP 400 responses', () => {
    it('returns 400 when jobTitle is missing from the body', async () => {
      const res = await request(app).post('/api/questions').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 when jobTitle is an empty string', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/empty/i);
    });

    it('returns 400 when jobTitle is whitespace-only', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: '   ' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when jobTitle is not a string', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 12345 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/string/i);
    });

    it('returns 400 when jobTitle exceeds 100 characters', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'A'.repeat(101) });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/100/);
    });

    it('returns 400 for a single-character jobTitle (below minimum)', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'X' });
      expect(res.status).toBe(400);
    });

    it('does NOT call Gemini when input is invalid', async () => {
      // We deliberately do NOT set up a mock here — if Gemini were called,
      // the test would throw because GoogleGenerativeAI is not configured.
      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: '' });
      expect(res.status).toBe(400);
      expect(GoogleGenerativeAI).not.toHaveBeenCalled();
    });
  });

  describe('AI API failure handling — HTTP 502 responses', () => {
    it('returns 502 when Gemini throws an error', async () => {
      mockGeminiFailure('Rate limit exceeded');

      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Data Analyst' });

      expect(res.status).toBe(502);
      expect(res.body).toHaveProperty('error');
    });

    it('returns a user-friendly error message (not internal stack trace)', async () => {
      mockGeminiFailure('Internal SDK error with sensitive details');

      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Engineer' });

      // The raw error message should NOT be exposed to the client
      expect(res.body.error).not.toContain('Internal SDK error with sensitive details');
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });

    it('returns 502 when Gemini returns an empty response', async () => {
      mockGeminiSuccess(''); // Empty text triggers parse failure

      const res = await request(app)
        .post('/api/questions')
        .send({ jobTitle: 'Designer' });

      expect(res.status).toBe(502);
    });
  });

  describe('method not allowed', () => {
    it('returns 404 for GET /api/questions', async () => {
      const res = await request(app).get('/api/questions');
      // Express returns 404 for unmatched routes by default
      expect(res.status).toBe(404);
    });
  });
});