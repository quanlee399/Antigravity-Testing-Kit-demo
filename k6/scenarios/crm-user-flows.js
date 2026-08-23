import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, DEFAULT_HEADERS } from '../config/environments.js';
import { authenticate } from '../utils/auth.js';
import { randomThinkTime } from '../utils/helpers.js';

export function loginFlow() {
  return group('01_Login_Flow', () => {
    return authenticate();
  });
}

export function dashboardFlow() {
  return group('02_Dashboard_View', () => {
    const res = http.get(`${BASE_URL}/admin/`, { headers: DEFAULT_HEADERS });
    const success = check(res, {
      'Dashboard status is 200': (r) => r.status === 200,
      'Dashboard title/content present': (r) => r.body && (r.body.includes('Perfex') || r.body.includes('dashboard')),
    });
    randomThinkTime(1, 2);
    return success;
  });
}

export function customersFlow() {
  return group('03_Customers_List', () => {
    const res = http.get(`${BASE_URL}/admin/clients`, { headers: DEFAULT_HEADERS });
    const success = check(res, {
      'Customers list status is 200': (r) => r.status === 200,
      'Customers page loaded': (r) => r.body && r.body.includes('clients'),
    });
    randomThinkTime(1, 3);
    return success;
  });
}

export function invoicesFlow() {
  return group('04_Invoices_List', () => {
    const res = http.get(`${BASE_URL}/admin/invoices`, { headers: DEFAULT_HEADERS });
    const success = check(res, {
      'Invoices list status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
    return success;
  });
}

export function projectsFlow() {
  return group('05_Projects_List', () => {
    const res = http.get(`${BASE_URL}/admin/projects`, { headers: DEFAULT_HEADERS });
    const success = check(res, {
      'Projects list status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
    return success;
  });
}

export function tasksFlow() {
  return group('06_Tasks_List', () => {
    const res = http.get(`${BASE_URL}/admin/tasks`, { headers: DEFAULT_HEADERS });
    const success = check(res, {
      'Tasks list status is 200': (r) => r.status === 200,
    });
    randomThinkTime(1, 2);
    return success;
  });
}

export function fullUserJourney() {
  const authed = loginFlow();
  if (authed) {
    dashboardFlow();
    customersFlow();
    invoicesFlow();
    projectsFlow();
    tasksFlow();
  }
}
