'use strict';

/**
 * Unit tests: validation utility
 *
 * Pure function tests — no mocking needed.
 * These run entirely in memory and are extremely fast.
 */

const { validateJobTitle } = require('../../utils/validation');

describe('validateJobTitle', () => {
  // ---- Valid inputs ----
  describe('valid inputs', () => {
    it('accepts a normal job title', () => {
      const result = validateJobTitle('Software Engineer');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Software Engineer');
    });

    it('trims leading and trailing whitespace', () => {
      const result = validateJobTitle('  Product Manager  ');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Product Manager');
    });

    it('accepts a 2-character title (minimum length)', () => {
      const result = validateJobTitle('QA');
      expect(result.valid).toBe(true);
    });

    it('accepts a title at the maximum length boundary', () => {
      const title = 'A'.repeat(100);
      const result = validateJobTitle(title);
      expect(result.valid).toBe(true);
    });

    it('accepts titles with hyphens and parentheses', () => {
      const result = validateJobTitle('Full-Stack Developer (React)');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('Full-Stack Developer (React)');
    });
  });

  // ---- Invalid inputs ----
  describe('invalid inputs', () => {
    it('rejects undefined', () => {
      const result = validateJobTitle(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/required/i);
    });

    it('rejects null', () => {
      const result = validateJobTitle(null);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/required/i);
    });

    it('rejects a non-string value (number)', () => {
      const result = validateJobTitle(42);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/string/i);
    });

    it('rejects an empty string', () => {
      const result = validateJobTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });

    it('rejects a whitespace-only string', () => {
      const result = validateJobTitle('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });

    it('rejects a single character (below minimum length)', () => {
      const result = validateJobTitle('A');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/at least/i);
    });

    it('rejects a title exceeding 100 characters', () => {
      const longTitle = 'A'.repeat(101);
      const result = validateJobTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/100/);
    });

    it('rejects titles with HTML-injection characters', () => {
      const result = validateJobTitle('<script>alert("xss")</script>');
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid characters/i);
    });
  });
});