'use strict';

/**
 * Unit tests: Gemini service (pure functions)
 *
 * We test buildPrompt and parseQuestions independently because they are
 * pure functions — no mocking required.
 *
 * generateQuestions is tested in the integration suite where we mock
 * the @google/generative-ai module entirely.
 */

const { buildPrompt, parseQuestions } = require('../../services/gemini');

describe('buildPrompt', () => {
  it('includes the job title in the prompt', () => {
    const prompt = buildPrompt('Data Scientist');
    expect(prompt).toContain('Data Scientist');
  });

  it('requests exactly 3 questions', () => {
    const prompt = buildPrompt('Product Manager');
    // The number 3 should appear in the instructions
    expect(prompt).toMatch(/3/);
  });

  it('returns a non-empty string', () => {
    const prompt = buildPrompt('Engineer');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('instructs the model to avoid generic questions', () => {
    const prompt = buildPrompt('Any Role');
    expect(prompt.toLowerCase()).toContain('generic');
  });
});

describe('parseQuestions', () => {
  describe('standard numbered format', () => {
    it('parses "1. Question" format correctly', () => {
      const raw = '1. How do you handle conflict?\n2. Describe a challenge.\n3. What is your approach to metrics?';
      const result = parseQuestions(raw);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('How do you handle conflict?');
      expect(result[1]).toBe('Describe a challenge.');
      expect(result[2]).toBe('What is your approach to metrics?');
    });

    it('parses "1) Question" format correctly', () => {
      const raw = '1) First question here\n2) Second question here\n3) Third question here';
      const result = parseQuestions(raw);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('First question here');
    });

    it('strips the numbering prefix from each question', () => {
      const raw = '1. Question A\n2. Question B\n3. Question C';
      const result = parseQuestions(raw);
      result.forEach((q) => {
        expect(q).not.toMatch(/^\d+/);
      });
    });

    it('ignores blank lines between questions', () => {
      const raw = '1. Question A\n\n2. Question B\n\n3. Question C\n\n';
      const result = parseQuestions(raw);
      expect(result).toHaveLength(3);
    });

    it('returns only the first 3 if the model returns more', () => {
      const raw = '1. Q1\n2. Q2\n3. Q3\n4. Q4\n5. Q5';
      const result = parseQuestions(raw);
      expect(result).toHaveLength(3);
    });
  });

  describe('fallback behaviour', () => {
    it('falls back to first 3 lines if no numbered format detected', () => {
      const raw = 'Question A\nQuestion B\nQuestion C';
      const result = parseQuestions(raw);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Question A');
    });

    it('throws if fewer than 3 questions can be extracted', () => {
      const raw = '1. Only one question here';
      expect(() => parseQuestions(raw)).toThrow();
    });

    it('throws on an empty string', () => {
      expect(() => parseQuestions('')).toThrow();
    });
  });
});