import http from 'k6/http';
import { check, group } from 'k6';
import { ENV } from '../config/environments.js';
import { getTodoistHeaders } from '../utils/auth.js';
import { randomThinkTime, generateTraceableData } from '../utils/helpers.js';

export function todoistScenario() {
  const token = ENV.TODOIST_BEARER_TOKEN;

  // If token is missing, empty or dummy placeholder, skip gracefully
  if (!token || token === 'dummy_todoist_token_123' || token.trim() === '' || token.length < 20) {
    console.log('Skipping Todoist API Scenario: Valid TODOIST_BEARER_TOKEN not provided.');
    return;
  }

  const baseUrl = ENV.TODOIST_BASE_URL;
  const headers = getTodoistHeaders();

  // Probe request: expectedStatuses prevents http_req_failed if token is expired/invalid
  const probe = http.get(`${baseUrl}/projects`, {
    headers,
    responseCallback: http.expectedStatuses(200, 401),
  });

  if (probe.status !== 200) {
    console.warn(`Todoist token unauthorized (HTTP ${probe.status}). Skipping Todoist scenario.`);
    return;
  }

  group('Todoist_01_GetProjects', () => {
    check(probe, {
      'Todoist Get Projects status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
  });

  group('Todoist_02_GetTasks', () => {
    const res = http.get(`${baseUrl}/tasks`, { headers });
    check(res, {
      'Todoist Get Tasks status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
  });

  group('Todoist_03_CreateTask', () => {
    const testData = generateTraceableData('todoist_task');
    const payload = JSON.stringify({
      content: `Performance Task: ${testData.name}`,
      due_string: 'tomorrow at 12:00',
      priority: 4,
    });

    const res = http.post(`${baseUrl}/tasks`, payload, { headers });
    check(res, {
      'Todoist Create Task status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
    randomThinkTime(1, 2);
  });
}

export default function () {
  todoistScenario();
}
