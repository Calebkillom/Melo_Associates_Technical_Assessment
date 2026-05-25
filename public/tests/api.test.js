'use strict';

/**
 * Unit tests: API module (public/js/api.js)
 *
 * The browser's `fetch` is mocked using Jest's global mock system.
 * No real network calls are made — this is fast and deterministic.
 */

const { fetchQuestions } = require('../js/api');

// ---- Helpers ----

/**
 * Creates a mock fetch response object.
 * @param {object} body - JSON response body
 * @param {number} status - HTTP status code
 * @returns {Promise<Response>}
 */
function mockFetchResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  // Reset the global fetch mock before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('fetchQuestions', () => {
  describe('successful requests', () => {
    it('returns an array of 3 questions on success', async () => {
      const mockQuestions = ['Q1', 'Q2', 'Q3'];
      global.fetch.mockReturnValue(mockFetchResponse({ questions: mockQuestions }));

      const result = await fetchQuestions('Software Engineer');
      expect(result).toEqual(mockQuestions);
    });

    it('calls fetch with the correct method and headers', async () => {
      global.fetch.mockReturnValue(mockFetchResponse({ questions: ['Q1', 'Q2', 'Q3'] }));

      await fetchQuestions('Designer');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/questions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
    });

    it('serializes the job title into the request body', async () => {
      global.fetch.mockReturnValue(mockFetchResponse({ questions: ['Q1', 'Q2', 'Q3'] }));

      await fetchQuestions('Data Analyst');

      const callArgs = global.fetch.mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.jobTitle).toBe('Data Analyst');
    });
  });

  describe('server error responses', () => {
    it('throws when the server returns a 400 status', async () => {
      global.fetch.mockReturnValue(
        mockFetchResponse({ error: 'Job title cannot be empty.' }, 400)
      );

      await expect(fetchQuestions('')).rejects.toThrow('Job title cannot be empty.');
    });

    it('throws when the server returns a 502 status', async () => {
      global.fetch.mockReturnValue(
        mockFetchResponse({ error: 'Failed to generate questions.' }, 502)
      );

      await expect(fetchQuestions('Engineer')).rejects.toThrow(
        'Failed to generate questions.'
      );
    });

    it('throws a generic message when server error has no error field', async () => {
      global.fetch.mockReturnValue(mockFetchResponse({}, 500));

      await expect(fetchQuestions('Manager')).rejects.toThrow(/500/);
    });
  });

  describe('unexpected response shapes', () => {
    it('throws when questions array is empty', async () => {
      global.fetch.mockReturnValue(mockFetchResponse({ questions: [] }));

      await expect(fetchQuestions('Analyst')).rejects.toThrow(/unexpected response/i);
    });

    it('throws when questions field is not an array', async () => {
      global.fetch.mockReturnValue(mockFetchResponse({ questions: 'not an array' }));

      await expect(fetchQuestions('Analyst')).rejects.toThrow(/unexpected response/i);
    });
  });

  describe('network failures', () => {
    it('throws a user-friendly message when fetch rejects (offline)', async () => {
      global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(fetchQuestions('Engineer')).rejects.toThrow(/network error/i);
    });
  });
});