import { Rate, Trend, Counter } from 'k6/metrics';
import { THRESHOLDS } from '../config/environments.js';
import { fullUserJourney } from '../scenarios/crm-user-flows.js';

export const errorRate = new Rate('errors');
export const requestCounter = new Counter('total_requests');
export const userJourneyDuration = new Trend('user_journey_duration');

export const options = {
  stages: [
    { duration: '20s', target: 5 },   // Ramp-up to 5 users
    { duration: '40s', target: 5 },   // Steady state load
    { duration: '10s', target: 0 },   // Ramp-down
  ],
  thresholds: THRESHOLDS.load,
};

export default function () {
  const startTime = Date.now();

  fullUserJourney();

  userJourneyDuration.add(Date.now() - startTime);
  requestCounter.add(1);
}
