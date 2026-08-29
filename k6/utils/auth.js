import http from 'k6/http';
import { check } from 'k6';
import { ENV, DEFAULT_HEADERS } from '../config/environments.js';

/**
 * Authenticates against Restful Booker (Herokuapp) API
 * Returns access token string or empty string
 */
export function getBookerToken(username = 'admin', password = 'password123') {
  const url = `${ENV.HEROKUAPP_BASE_URL}/auth`;
  const payload = JSON.stringify({ username, password });
  
  const res = http.post(url, payload, { headers: DEFAULT_HEADERS });
  const success = check(res, {
    'Booker Auth status is 200': (r) => r.status === 200,
    'Booker Auth returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (success) {
    const body = JSON.parse(res.body);
    return body.token;
  }
  return '';
}

/**
 * Returns authorization headers for Todoist API
 */
export function getTodoistHeaders() {
  return Object.assign({}, DEFAULT_HEADERS, {
    'Authorization': `Bearer ${ENV.TODOIST_BEARER_TOKEN}`,
  });
}
