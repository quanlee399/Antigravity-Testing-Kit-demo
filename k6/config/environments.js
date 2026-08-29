// k6 Environment configuration for Multi-API Suite (ReqRes, Herokuapp, Petstore, Todoist)

export const ENV = {
  REQRES_BASE_URL: __ENV.REQRES_BASE_URL || 'https://reqres.in/api',
  HEROKUAPP_BASE_URL: __ENV.HEROKUAPP_BASE_URL || 'https://restful-booker.herokuapp.com',
  PETSTORE_BASE_URL: __ENV.PETSTORE_BASE_URL || 'https://petstore.swagger.io/v2',
  TODOIST_BASE_URL: __ENV.TODOIST_BASE_URL || 'https://api.todoist.com/rest/v2',
  TODOIST_BEARER_TOKEN: __ENV.TODOIST_BEARER_TOKEN || 'dummy_todoist_token_123',
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'k6-performance-testing-agent/1.0',
};

export const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<1500', 'p(99)<2500'],
    http_req_failed: ['rate<0.02'],
    checks: ['rate>0.95'],
  },
  load: {
    http_req_duration: ['p(95)<2000', 'p(99)<3500'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.90'],
  },
  stress: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.10'],
  },
  spike: {
    http_req_duration: ['p(95)<3500'],
    http_req_failed: ['rate<0.15'],
  },
};
