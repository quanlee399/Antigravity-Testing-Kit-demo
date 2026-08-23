import { Rate, Trend, Counter } from 'k6/metrics';
import { THRESHOLDS } from '../config/environments.js';
import { fullUserJourney } from '../scenarios/crm-user-flows.js';

// Custom Metrics
export const errorRate = new Rate('errors');
export const requestCounter = new Counter('total_requests');
export const userJourneyDuration = new Trend('user_journey_duration');

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: THRESHOLDS.smoke,
};

export default function () {
  const startTime = Date.now();
  
  fullUserJourney();

  userJourneyDuration.add(Date.now() - startTime);
  requestCounter.add(1);
}
