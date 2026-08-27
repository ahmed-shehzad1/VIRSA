const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const REQUEST_TIMEOUT_MS = 30000;

// 15.7 - the API key NEVER leaves this file. It's read from server env only,
// attached as a request header here, and never included in any response
// sent back to the frontend.
async function callClaude(systemPrompt, userMessage, { maxTokens = 600 } = {}) {
  if (!config.ai.anthropicApiKey) {
    throw ApiError.internal('AI service is not configured on this server');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.ai.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.ai.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    // 15.5 - network failure / timeout
    if (err.name === 'AbortError') {
      throw ApiError.internal('AI service timed out. Please try again.');
    }
    throw ApiError.internal('Failed to reach the AI service. Please try again.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // 15.5 - never leak provider error details (could include partial key info) to the client
    console.error('[ai.service] Anthropic API error:', response.status, await response.text().catch(() => ''));
    if (response.status === 429) throw ApiError.tooManyRequests('The AI service is busy right now. Please try again shortly.', 'AI_PROVIDER_RATE_LIMITED');
    throw ApiError.internal('The AI service could not process this request right now.');
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  if (!textBlock) throw ApiError.internal('The AI service returned an unexpected response.');

  return textBlock.text.trim();
}

module.exports = { callClaude };