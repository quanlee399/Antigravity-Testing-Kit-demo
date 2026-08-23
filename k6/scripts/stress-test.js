import { Rate, Trend, Counter } from 'k6/metrics';
import { THRESHOLDS } from '../config/environments.js';
import { fullUserJourney } from '../scenarios/crm-user-flows.js';

export const errorRate = new Rate('errors');
export const requestCounter = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '30s', target: 20 },
    { duration: '15s', target: 0 },
  ],
  thresholds: THRESHOLDS.stress,
};

export default function () {
  fullUserJourney();
}
