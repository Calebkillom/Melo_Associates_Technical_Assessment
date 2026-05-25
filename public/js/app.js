'use strict';

/**
 * App — frontend entry point.
 *
 * Wires DOM events to ui.js and api.js modules.
 * All DOM queries are scoped here. Business logic lives elsewhere.
 *
 * Loading flow:
 *   1. setLoadingState on button
 *   2. showSkeleton — 3 shimmer cards appear
 *   3. API call resolves
 *   4. hideSkeleton, renderQuestions, showResults
 *   5. clearLoadingState
 */

/* global fetchQuestions, ui */

// ---- DOM references ----
const jobTitleInput   = document.getElementById('jobTitleInput');
const generateBtn     = document.getElementById('generateBtn');
const errorAlertEl    = document.getElementById('errorAlert');
const errorTextEl     = document.getElementById('errorText');
const skeletonSection = document.getElementById('skeletonSection');
const resultsSection  = document.getElementById('resultsSection');
const questionList    = document.getElementById('questionList');
const roleLabelEl     = document.getElementById('roleLabel');
const resetBtn        = document.getElementById('resetBtn');
const regenerateBtn   = document.getElementById('regenerateBtn');

// Track the last successful job title so regenerate can reuse it
let lastJobTitle = '';

// ---- Event listeners ----
generateBtn.addEventListener('click', handleGenerate);
resetBtn.addEventListener('click', handleReset);
regenerateBtn.addEventListener('click', handleRegenerate);

jobTitleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleGenerate();
});

// Chip buttons — fill input and auto-submit
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    const role = chip.getAttribute('data-role');
    if (role) {
      jobTitleInput.value = role;
      jobTitleInput.focus();
      handleGenerate();
    }
  });
});

// ---- Handlers ----

async function handleGenerate() {
  const jobTitle = jobTitleInput.value.trim();

  // Client-side validation
  if (!jobTitle) {
    ui.showError(errorAlertEl, errorTextEl, 'Please enter a job title before generating questions.');
    jobTitleInput.focus();
    return;
  }

  await generate(jobTitle);
}

async function handleRegenerate() {
  if (!lastJobTitle) return;
  await generate(lastJobTitle);
}

async function generate(jobTitle) {
  // Reset previous state
  ui.hideError(errorAlertEl, errorTextEl);
  ui.hideResults(resultsSection, questionList);
  ui.setLoadingState(generateBtn);
  ui.showSkeleton(skeletonSection);

  try {
    const questions = await fetchQuestions(jobTitle);
    lastJobTitle = jobTitle;

    // Brief pause so shimmer is visible even on fast connections — better UX
    await sleep(400);

    ui.hideSkeleton(skeletonSection);
    ui.renderQuestions(questionList, questions);
    ui.showResults(resultsSection, roleLabelEl, jobTitle);
  } catch (err) {
    ui.hideSkeleton(skeletonSection);
    ui.showError(
      errorAlertEl,
      errorTextEl,
      err.message || 'Something went wrong. Please try again.'
    );
  } finally {
    ui.clearLoadingState(generateBtn);
  }
}

function handleReset() {
  ui.hideResults(resultsSection, questionList);
  ui.hideError(errorAlertEl, errorTextEl);
  ui.hideSkeleton(skeletonSection);
  jobTitleInput.value = '';
  lastJobTitle = '';
  jobTitleInput.focus();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Utility ----

/**
 * Returns a promise that resolves after `ms` milliseconds.
 * Used to ensure skeleton shimmer is visible on fast connections.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// CommonJS export for test environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleGenerate, handleReset, handleRegenerate, sleep };
}