import { Rate, Trend } from 'k6/metrics';
import { THRESHOLDS } from '../config/environments.js';
import { fullUserJourney } from '../scenarios/crm-user-flows.js';

export const options = {
  stages: [
    { duration: '10s', target: 2 },    // Baseline load
    { duration: '10s', target: 20 },   // Sudden Spike!
    { duration: '30s', target: 20 },   // Sustained Spike
    { duration: '10s', target: 2 },    // Recovery
    { duration: '10s', target: 0 },    // Ramp-down
  ],
  thresholds: THRESHOLDS.spike,
};

export default function () {
  fullUserJourney();
}
