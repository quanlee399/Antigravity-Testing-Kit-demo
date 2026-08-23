import { THRESHOLDS } from '../config/environments.js';
import { fullUserJourney } from '../scenarios/crm-user-flows.js';

export const options = {
  stages: [
    { duration: '15s', target: 5 },   // Ramp up
    { duration: '2m', target: 5 },    // Shortened demo soak duration (2m)
    { duration: '15s', target: 0 },   // Ramp down
  ],
  thresholds: THRESHOLDS.load,
};

export default function () {
  fullUserJourney();
}
