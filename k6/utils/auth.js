import http from 'k6/http';
import { check } from 'k6';
import { AUTH_URL, CREDENTIALS, DEFAULT_HEADERS } from '../config/environments.js';
import { extractCsrfToken } from './helpers.js';

/**
 * Authenticates against Perfex CRM using 2-step CSRF + Form Login
 * Returns true if login is successful, false otherwise.
 */
export function authenticate() {
  // Step 1: GET authentication page to retrieve CSRF token and session cookies
  const getRes = http.get(AUTH_URL, { headers: DEFAULT_HEADERS });

  const getSuccess = check(getRes, {
    'GET auth page status is 200': (r) => r.status === 200,
    'GET auth page has form': (r) => r.body && r.body.includes('csrf_token_name'),
  });

  if (!getSuccess) {
    console.error('Failed to load authentication page');
    return false;
  }

  const csrfToken = extractCsrfToken(getRes.body);
  if (!csrfToken) {
    console.error('CSRF token not found in response');
    return false;
  }

  // Step 2: POST form data to submit login credentials
  const loginPayload = {
    csrf_token_name: csrfToken,
    email: CREDENTIALS.email,
    password: CREDENTIALS.password,
  };

  const loginHeaders = Object.assign({}, DEFAULT_HEADERS, {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Origin': 'https://crm.anhtester.com',
    'Referer': AUTH_URL,
  });

  const postRes = http.post(AUTH_URL, loginPayload, {
    headers: loginHeaders,
    redirects: 0, // Handle redirects manually or observe 303 status
  });

  const loginSuccess = check(postRes, {
    'POST login redirects or succeeds (status 200 or 303)': (r) => r.status === 200 || r.status === 303,
  });

  return loginSuccess;
}
