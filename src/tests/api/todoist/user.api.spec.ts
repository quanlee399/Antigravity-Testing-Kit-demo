import { test, expect } from '@playwright/test';
import { TodoistUserApi } from '../../../api/todoist/helpers/user-api';

test.describe('Todoist API - User Module Endpoints', () => {
  let userApi: TodoistUserApi;

  test.beforeEach(({ request }) => {
    userApi = new TodoistUserApi(request);
  });

  test('TC_TODOIST_USER_001: [Happy Path] Get current user profile', async () => {
    const response = await userApi.getUserProfile();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
  });

  test('TC_TODOIST_USER_002: [Negative/Auth] Get user profile missing Bearer token', async () => {
    const response = await userApi.getUserProfile('');
    expect(response.status()).toBe(401);
  });

  test('TC_TODOIST_USER_003: [Negative/Auth] Get user profile with invalid Bearer token', async () => {
    const response = await userApi.getUserProfile('invalid_token_xyz_123');
    expect(response.status()).toBe(401);
  });
});
