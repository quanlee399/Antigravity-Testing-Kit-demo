import http from 'k6/http';
import { check, group } from 'k6';
import { ENV, DEFAULT_HEADERS } from '../config/environments.js';
import { randomThinkTime, generateTraceableData } from '../utils/helpers.js';

export function reqresScenario() {
  const baseUrl = ENV.REQRES_BASE_URL;

  group('ReqRes_01_ListUsers', () => {
    const res = http.get(`${baseUrl}/users?page=2`, { headers: DEFAULT_HEADERS });
    check(res, {
      'ReqRes List Users status is 200': (r) => r.status === 200,
      'ReqRes List Users response has data array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data) && body.data.length > 0;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);
  });

  group('ReqRes_02_GetSingleUser', () => {
    const res = http.get(`${baseUrl}/users/2`, { headers: DEFAULT_HEADERS });
    check(res, {
      'ReqRes Get Single User status is 200': (r) => r.status === 200,
      'ReqRes Single User email exists': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.email !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);
  });

  group('ReqRes_03_CreateUser', () => {
    const testData = generateTraceableData('reqres_user');
    const payload = JSON.stringify({
      name: testData.name,
      job: 'Automation QA Engineer',
    });

    const res = http.post(`${baseUrl}/users`, payload, { headers: DEFAULT_HEADERS });
    check(res, {
      'ReqRes Create User status is 201': (r) => r.status === 201,
      'ReqRes Create User returns ID': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);
  });

  group('ReqRes_04_LoginUser', () => {
    const payload = JSON.stringify({
      email: 'eve.holt@reqres.in',
      password: 'cityslicka',
    });

    const res = http.post(`${baseUrl}/login`, payload, { headers: DEFAULT_HEADERS });
    check(res, {
      'ReqRes Login status is 200': (r) => r.status === 200,
      'ReqRes Login returns token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.token !== undefined;
        } catch (e) {
          return false;
        }
      },
    });
    randomThinkTime(1, 2);
  });
}

export default function () {
  reqresScenario();
}
