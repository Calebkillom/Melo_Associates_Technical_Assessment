'use strict';

/**
 * Unit tests: UI module (public/js/ui.js)
 *
 * Runs in jsdom. Creates minimal DOM fixtures per test.
 * No network calls, no app.js wiring — pure DOM function tests.
 */

const ui = require('../js/ui');

// ---- DOM element factory ----
function el(tag, attrs = {}) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => element.setAttribute(k, v));
  return element;
}

function makeBtn() {
  const btn = el('button');
  btn.disabled = false;
  return btn;
}

// ================================================================
// escapeHtml
// ================================================================
describe('escapeHtml', () => {
  it('escapes & character', () => expect(ui.escapeHtml('a & b')).toBe('a &amp; b'));
  it('escapes < and >', () => expect(ui.escapeHtml('<div>')).toBe('&lt;div&gt;'));
  it('escapes double quotes', () => expect(ui.escapeHtml('"hi"')).toBe('&quot;hi&quot;'));
  it('escapes single quotes', () => expect(ui.escapeHtml("it's")).toBe('it&#039;s'));
  it('passes plain text unchanged', () => expect(ui.escapeHtml('hello')).toBe('hello'));
  it('handles empty string', () => expect(ui.escapeHtml('')).toBe(''));
  it('escapes multiple chars in one string', () => {
    expect(ui.escapeHtml('<b>Tom & "Jerry"</b>')).toBe(
      '&lt;b&gt;Tom &amp; &quot;Jerry&quot;&lt;/b&gt;'
    );
  });
});

// ================================================================
// setLoadingState / clearLoadingState
// ================================================================
describe('setLoadingState', () => {
  it('disables the button', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    expect(btn.disabled).toBe(true);
  });

  it('adds is-loading class', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    expect(btn.classList.contains('is-loading')).toBe(true);
  });

  it('sets aria-busy to true', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    expect(btn.getAttribute('aria-busy')).toBe('true');
  });
});

describe('clearLoadingState', () => {
  it('re-enables the button', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    ui.clearLoadingState(btn);
    expect(btn.disabled).toBe(false);
  });

  it('removes is-loading class', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    ui.clearLoadingState(btn);
    expect(btn.classList.contains('is-loading')).toBe(false);
  });

  it('sets aria-busy to false', () => {
    const btn = makeBtn();
    ui.setLoadingState(btn);
    ui.clearLoadingState(btn);
    expect(btn.getAttribute('aria-busy')).toBe('false');
  });
});

// ================================================================
// showError / hideError
// ================================================================
describe('showError', () => {
  it('un-hides the alert element', () => {
    const alertEl = el('div');
    alertEl.hidden = true;
    const textEl = el('span');
    ui.showError(alertEl, textEl, 'Test error');
    expect(alertEl.hidden).toBe(false);
  });

  it('sets the error message text', () => {
    const alertEl = el('div');
    alertEl.hidden = true;
    const textEl = el('span');
    ui.showError(alertEl, textEl, 'Something broke');
    expect(textEl.textContent).toBe('Something broke');
  });
});

describe('hideError', () => {
  it('hides the alert element', () => {
    const alertEl = el('div');
    alertEl.hidden = false;
    const textEl = el('span');
    textEl.textContent = 'error';
    ui.hideError(alertEl, textEl);
    expect(alertEl.hidden).toBe(true);
  });

  it('clears the error message text', () => {
    const alertEl = el('div');
    const textEl = el('span');
    textEl.textContent = 'old error';
    ui.hideError(alertEl, textEl);
    expect(textEl.textContent).toBe('');
  });
});

// ================================================================
// showSkeleton / hideSkeleton
// ================================================================
describe('showSkeleton', () => {
  it('un-hides the skeleton section', () => {
    const skeletonEl = el('div');
    skeletonEl.hidden = true;
    ui.showSkeleton(skeletonEl);
    expect(skeletonEl.hidden).toBe(false);
  });

  it('removes aria-hidden attribute', () => {
    const skeletonEl = el('div');
    skeletonEl.setAttribute('aria-hidden', 'true');
    ui.showSkeleton(skeletonEl);
    expect(skeletonEl.getAttribute('aria-hidden')).toBeNull();
  });
});

describe('hideSkeleton', () => {
  it('hides the skeleton section', () => {
    const skeletonEl = el('div');
    skeletonEl.hidden = false;
    ui.hideSkeleton(skeletonEl);
    expect(skeletonEl.hidden).toBe(true);
  });

  it('sets aria-hidden to true', () => {
    const skeletonEl = el('div');
    ui.hideSkeleton(skeletonEl);
    expect(skeletonEl.getAttribute('aria-hidden')).toBe('true');
  });
});

// ================================================================
// renderQuestions
// ================================================================
describe('renderQuestions', () => {
  it('renders exactly 3 question cards', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Q1', 'Q2', 'Q3']);
    expect(list.querySelectorAll('.question-card')).toHaveLength(3);
  });

  it('each card displays the correct question text', () => {
    const list = el('div');
    const questions = ['How do you prioritise?', 'Describe a challenge.', 'What are your KPIs?'];
    ui.renderQuestions(list, questions);
    const texts = [...list.querySelectorAll('.question-card__text')].map((e) => e.textContent);
    expect(texts).toEqual(questions);
  });

  it('clears previous questions before rendering', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Old Q1', 'Old Q2', 'Old Q3']);
    ui.renderQuestions(list, ['New Q1', 'New Q2', 'New Q3']);
    expect(list.querySelectorAll('.question-card')).toHaveLength(3);
    expect(list.querySelector('.question-card__text').textContent).toBe('New Q1');
  });

  it('escapes HTML in question text to prevent XSS', () => {
    const list = el('div');
    ui.renderQuestions(list, ['<script>alert("xss")</script>', 'Q2', 'Q3']);
    const firstText = list.querySelector('.question-card__text').innerHTML;
    expect(firstText).not.toContain('<script>');
    expect(firstText).toContain('&lt;script&gt;');
  });

  it('labels each card with the correct question number', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Q1', 'Q2', 'Q3']);
    const numbers = [...list.querySelectorAll('.question-card__number')].map(
      (e) => e.textContent
    );
    expect(numbers).toEqual(['Q1', 'Q2', 'Q3']);
  });

  it('sets aria-label on each card for accessibility', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Q1', 'Q2', 'Q3']);
    const cards = list.querySelectorAll('.question-card');
    expect(cards[0].getAttribute('aria-label')).toBe('Question 1');
    expect(cards[2].getAttribute('aria-label')).toBe('Question 3');
  });

  it('each card includes a copy button', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Q1', 'Q2', 'Q3']);
    const copyBtns = list.querySelectorAll('.btn-copy');
    expect(copyBtns).toHaveLength(3);
  });

  it('applies staggered animation delay via inline style', () => {
    const list = el('div');
    ui.renderQuestions(list, ['Q1', 'Q2', 'Q3']);
    const cards = [...list.querySelectorAll('.question-card')];
    expect(cards[0].style.animationDelay).toBe('0ms');
    expect(cards[1].style.animationDelay).toBe('80ms');
    expect(cards[2].style.animationDelay).toBe('160ms');
  });
});

// ================================================================
// showResults / hideResults
// ================================================================
describe('showResults', () => {
  it('un-hides the results section', () => {
    const section = el('div');
    section.hidden = true;
    section.scrollIntoView = jest.fn();
    const badge = el('span');
    ui.showResults(section, badge, 'Product Manager');
    expect(section.hidden).toBe(false);
  });

  it('sets badge text to the job title', () => {
    const section = el('div');
    section.hidden = true;
    section.scrollIntoView = jest.fn();
    const badge = el('span');
    ui.showResults(section, badge, 'Data Analyst');
    expect(badge.textContent).toBe('Data Analyst');
  });
});

describe('hideResults', () => {
  it('hides the results section', () => {
    const section = el('div');
    section.hidden = false;
    const list = el('div');
    ui.hideResults(section, list);
    expect(section.hidden).toBe(true);
  });

  it('clears the question list HTML', () => {
    const section = el('div');
    const list = el('div');
    list.innerHTML = '<p>Old content</p>';
    ui.hideResults(section, list);
    expect(list.innerHTML).toBe('');
  });
});