'use strict';

/**
 * Jest setup file for frontend tests
 *
 * Runs before each test file in the jsdom environment.
 * Imports @testing-library/jest-dom which adds custom matchers like:
 *   toBeInTheDocument(), toBeVisible(), toHaveTextContent(), etc.
 */

require('@testing-library/jest-dom');