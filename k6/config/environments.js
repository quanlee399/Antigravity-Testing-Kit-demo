// k6 Environment configuration for Multi-API Suite (ReqRes, Herokuapp, Petstore, Todoist)

export const ENV = {
  REQRES_BASE_URL: __ENV.REQRES_BASE_URL || 'https://reqres.in/api',
  HEROKUAPP_BASE_URL: __ENV.HEROKUAPP_BASE_URL || 'https://restful-booker.herokuapp.com',
  PETSTORE_BASE_URL: __ENV.PETSTORE_BASE_URL || 'https://petstore.swagger.io/v2',
  TODOIST_BASE_URL: __ENV.TODOIST_BASE_URL || 'https://api.todoist.com/rest/v2',
  TODOIST_BEARER_TOKEN: __ENV.TODOIST_BEARER_TOKEN || '',
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': 'k6-performance-testing-agent/1.0',
};

// Adjusted threshold values suitable for public demo endpoints over internet
export const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<5000', 'p(99)<8000'],
    http_req_failed: ['rate<0.15'],
    checks: ['rate>0.80'],
  },
  load: {
    http_req_duration: ['p(95)<6000', 'p(99)<10000'],
    http_req_failed: ['rate<0.20'],
    checks: ['rate>0.75'],
  },
  stress: {
    http_req_duration: ['p(95)<8000'],
    http_req_failed: ['rate<0.25'],
  },
  spike: {
    http_req_duration: ['p(95)<10000'],
    http_req_failed: ['rate<0.30'],
  },
};
