import { THRESHOLDS } from '../config/environments.js';
import { reqresScenario } from '../scenarios/reqres-api.js';
import { herokuappScenario } from '../scenarios/herokuapp-api.js';
import { petstoreScenario } from '../scenarios/petstore-api.js';
import { todoistScenario } from '../scenarios/todoist-api.js';
import { generateK6Report } from '../utils/reporter.js';

export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp-up to 5 VUs
    { duration: '1m', target: 10 },   // Sustained load at 10 VUs
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: THRESHOLDS.load,
};

export default function () {
  const targetApi = __ENV.TARGET_API || 'all';

  if (targetApi === 'reqres' || targetApi === 'all') {
    reqresScenario();
  }
  if (targetApi === 'herokuapp' || targetApi === 'all') {
    herokuappScenario();
  }
  if (targetApi === 'petstore' || targetApi === 'all') {
    petstoreScenario();
  }
  if (targetApi === 'todoist' || targetApi === 'all') {
    todoistScenario();
  }
}

export function handleSummary(data) {
  return generateK6Report(data, 'k6 Load Performance Test Report');
}
