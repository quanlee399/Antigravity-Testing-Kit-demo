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
 * Generates a random integer between min and max (inclusive)
 */
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random alphanumeric string of given length
 */
export function getRandomString(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates traceable dynamic test data
 */
export function generateTraceableData(prefix = 'k6_test') {
  const timestamp = Date.now();
  const randomSuffix = getRandomString(5);
  return {
    name: `${prefix}_${timestamp}_${randomSuffix}`,
    email: `${prefix}_${timestamp}@auto.test`,
    id: timestamp + getRandomInt(100, 999),
  };
}
