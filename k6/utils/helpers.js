import { sleep } from 'k6';

/**
 * Sleeps for a random duration between minSeconds and maxSeconds
 * @param {number} minSeconds - Minimum sleep time in seconds (default 1)
 * @param {number} maxSeconds - Maximum sleep time in seconds (default 3)
 */
export function randomThinkTime(minSeconds = 1, maxSeconds = 3) {
  const duration = Math.random() * (maxSeconds - minSeconds) + minSeconds;
  sleep(duration);
}

/**
 * Extracts CSRF token from Perfex CRM HTML response
 * @param {string} html - HTML string of the authentication page
 * @returns {string|null} CSRF token value or null if not found
 */
export function extractCsrfToken(html) {
  if (!html) return null;
  const match = html.match(/name="csrf_token_name"\s+value="([^"]+)"/);
  return match ? match[1] : null;
}
