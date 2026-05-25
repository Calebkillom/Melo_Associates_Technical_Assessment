'use strict';

const JOB_TITLE_MIN_LENGTH = 2;
const JOB_TITLE_MAX_LENGTH = 100;

function validateJobTitle(jobTitle) {
  if (jobTitle === undefined || jobTitle === null) {
    return { valid: false, error: 'Job title is required.' };
  }

  if (typeof jobTitle !== 'string') {
    return { valid: false, error: 'Job title must be a string.' };
  }

  const sanitized = jobTitle.trim();

  if (sanitized.length === 0) {
    return { valid: false, error: 'Job title cannot be empty.' };
  }

  if (sanitized.length < JOB_TITLE_MIN_LENGTH) {
    return {
      valid: false,
      error: `Job title must be at least ${JOB_TITLE_MIN_LENGTH} characters.`,
    };
  }

  if (sanitized.length > JOB_TITLE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Job title must be ${JOB_TITLE_MAX_LENGTH} characters or fewer.`,
    };
  }

  const suspiciousPattern = /[<>{}|\\^`]/;
  if (suspiciousPattern.test(sanitized)) {
    return { valid: false, error: 'Job title contains invalid characters.' };
  }

  return { valid: true, sanitized };
}

module.exports = { validateJobTitle };
