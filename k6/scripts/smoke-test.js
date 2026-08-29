import { THRESHOLDS } from '../config/environments.js';
import { reqresScenario } from '../scenarios/reqres-api.js';
import { herokuappScenario } from '../scenarios/herokuapp-api.js';
import { petstoreScenario } from '../scenarios/petstore-api.js';
import { todoistScenario } from '../scenarios/todoist-api.js';
import { generateK6Report } from '../utils/reporter.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: THRESHOLDS.smoke,
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
  return generateK6Report(data, 'k6 Smoke Performance Test Report');
}
