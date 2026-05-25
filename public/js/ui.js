'use strict';

/**
 * UI module — all DOM manipulation for the redesigned frontend.
 *
 * Pure side-effect functions. No network calls, no business logic.
 * Each function takes explicit element references — no global DOM
 * queries — so they remain individually testable with jsdom.
 *
 * Exported via CommonJS for Jest; attached to `window.ui` for the browser.
 */

/* ----------------------------------------------------------------
   Security helper
   ---------------------------------------------------------------- */

/**
 * Escapes HTML special characters to prevent XSS injection.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/* ----------------------------------------------------------------
   Button / loading state
   ---------------------------------------------------------------- */

/**
 * Sets the generate button into loading state.
 * Shows a spinner; hides the label and arrow icon.
 * @param {HTMLButtonElement} btn
 */
function setLoadingState(btn) {
  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.setAttribute('aria-busy', 'true');
}

/**
 * Restores the generate button to its default interactive state.
 * @param {HTMLButtonElement} btn
 */
function clearLoadingState(btn) {
  btn.disabled = false;
  btn.classList.remove('is-loading');
  btn.setAttribute('aria-busy', 'false');
}

/* ----------------------------------------------------------------
   Error display
   ---------------------------------------------------------------- */

/**
 * Shows the error alert with a given message.
 * @param {HTMLElement} alertEl
 * @param {HTMLElement} textEl
 * @param {string} message
 */
function showError(alertEl, textEl, message) {
  textEl.textContent = message;
  alertEl.hidden = false;
}

/**
 * Hides the error alert and clears its message.
 * @param {HTMLElement} alertEl
 * @param {HTMLElement} textEl
 */
function hideError(alertEl, textEl) {
  alertEl.hidden = true;
  textEl.textContent = '';
}

/* ----------------------------------------------------------------
   Skeleton loading
   ---------------------------------------------------------------- */

/**
 * Shows the skeleton loading section (3 shimmer cards).
 * @param {HTMLElement} skeletonEl
 */
function showSkeleton(skeletonEl) {
  skeletonEl.hidden = false;
  skeletonEl.removeAttribute('aria-hidden');
}

/**
 * Hides the skeleton loading section.
 * @param {HTMLElement} skeletonEl
 */
function hideSkeleton(skeletonEl) {
  skeletonEl.hidden = true;
  skeletonEl.setAttribute('aria-hidden', 'true');
}

/* ----------------------------------------------------------------
   Question rendering
   ---------------------------------------------------------------- */

/**
 * Category tags assigned round-robin to add visual texture.
 * Intentionally vague — they don't come from the AI, just add structure.
 */
const CATEGORY_TAGS = ['Behavioural', 'Situational', 'Strategic'];

/**
 * Renders the 3 question cards into the list container.
 * Each card has staggered animation via inline animation-delay.
 *
 * @param {HTMLElement} listEl - The .question-list container
 * @param {string[]} questions - Array of question strings
 */
function renderQuestions(listEl, questions) {
  listEl.innerHTML = '';

  questions.forEach((question, index) => {
    const delay = index * 80; // ms — stagger each card
    const tag = CATEGORY_TAGS[index] || '';

    const card = document.createElement('article');
    card.className = 'question-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Question ${index + 1}`);
    card.style.animationDelay = `${delay}ms`;

    card.innerHTML = `
      <div class="question-card__top">
        <div class="question-card__meta">
          <span class="question-card__number">Q${index + 1}</span>
          ${tag ? `<span class="question-card__tag">${escapeHtml(tag)}</span>` : ''}
        </div>
        <button
          class="btn-copy"
          type="button"
          aria-label="Copy question ${index + 1} to clipboard"
          data-question="${escapeHtml(question)}"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
      </div>
      <p class="question-card__text">${escapeHtml(question)}</p>
    `;

    // Wire up the copy button
    const copyBtn = card.querySelector('.btn-copy');
    copyBtn.addEventListener('click', () => handleCopy(copyBtn, question));

    listEl.appendChild(card);
  });
}

/**
 * Handles clipboard copy for a question card.
 * Shows "Copied!" feedback then resets after 2s.
 *
 * @param {HTMLButtonElement} btn
 * @param {string} text
 */
function handleCopy(btn, text) {
  if (!navigator.clipboard) {
    // Graceful fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  } else {
    navigator.clipboard.writeText(text).catch(() => {
      // Silently fail — clipboard permission denied
    });
  }

  // Visual feedback
  btn.classList.add('is-copied');
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Copied!
  `;
  btn.setAttribute('aria-label', 'Copied!');

  setTimeout(() => {
    btn.classList.remove('is-copied');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      Copy
    `;
    btn.setAttribute('aria-label', `Copy question to clipboard`);
  }, 2000);
}

/* ----------------------------------------------------------------
   Results section visibility
   ---------------------------------------------------------------- */

/**
 * Shows the results section and sets the role badge text.
 * Smooth-scrolls into view.
 *
 * @param {HTMLElement} sectionEl
 * @param {HTMLElement} badgeEl
 * @param {string} jobTitle
 */
function showResults(sectionEl, badgeEl, jobTitle) {
  badgeEl.textContent = jobTitle;
  sectionEl.hidden = false;
  sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Hides the results section and clears question cards.
 * @param {HTMLElement} sectionEl
 * @param {HTMLElement} listEl
 */
function hideResults(sectionEl, listEl) {
  sectionEl.hidden = true;
  listEl.innerHTML = '';
}

/* ----------------------------------------------------------------
   CommonJS export (Jest) + browser global
   ---------------------------------------------------------------- */

const ui = {
  escapeHtml,
  setLoadingState,
  clearLoadingState,
  showError,
  hideError,
  showSkeleton,
  hideSkeleton,
  renderQuestions,
  showResults,
  hideResults,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ui;
}

if (typeof window !== 'undefined') {
  window.ui = ui;
}