'use strict';

/**
 * API module — frontend
 *
 * Responsibility: all network calls. Returns data or throws errors.
 * No DOM access happens here — this module is purely about data fetching.
 * Exported for testability.
 */

const API_ENDPOINT = '/api/questions';

/**
 * Sends a job title to the backend and returns an array of questions.
 *
 * @param {string} jobTitle - The validated, trimmed job title
 * @returns {Promise<string[]>} Array of 3 question strings
 * @throws {Error} With a user-friendly message on any failure
 */
async function fetchQuestions(jobTitle) {
  let response;

  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle }),
    });
  } catch (_networkError) {
    // fetch() itself throws on network failure (offline, DNS failure, etc.)
    throw new Error('Network error. Please check your connection and try again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error (${response.status}). Please try again.`);
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('Received an unexpected response from the server.');
  }

  return data.questions;
}

// CommonJS export for Jest; also attached to window for browser use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchQuestions };
}