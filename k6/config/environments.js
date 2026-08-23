// k6 Environment configuration for Perfex CRM

export const BASE_URL = __ENV.BASE_URL || 'https://crm.anhtester.com';
export const AUTH_URL = `${BASE_URL}/admin/authentication`;

export const CREDENTIALS = {
  email: __ENV.ADMIN_EMAIL || 'admin@example.com',
  password: __ENV.ADMIN_PASSWORD || '123456',
};

export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

export const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<1500', 'p(99)<2500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.95'],
  },
  load: {
    http_req_duration: ['p(95)<2000', 'p(99)<3500'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.95'],
  },
  stress: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
  spike: {
    http_req_duration: ['p(95)<3500'],
    http_req_failed: ['rate<0.10'],
  },
};
