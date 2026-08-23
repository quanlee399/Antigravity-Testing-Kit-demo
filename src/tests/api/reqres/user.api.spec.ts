import { test, expect } from '@playwright/test';
import { ReqresUserApi } from '../../../api/reqres/helpers/user-api';
import { ReqresTestDataGenerator } from '../../../api/reqres/helpers/test-data';

test.describe('ReqRes API - User Module Endpoints', () => {
  let userApi: ReqresUserApi;

  test.beforeEach(({ request }) => {
    userApi = new ReqresUserApi(request);
  });

  test('TC_REQRES_USER_001: [Happy Path] List users with pagination', async () => {
    const response = await userApi.listUsers(2);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.page).toBe(2);
    expect(body.per_page).toBe(6);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('TC_REQRES_USER_002: [Happy Path] Create new user with valid payload', async () => {
    const newUser = ReqresTestDataGenerator.generateRandomUser();
    const response = await userApi.createUser(newUser);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe(newUser.name);
    expect(body.job).toBe(newUser.job);
  });

  test('TC_REQRES_USER_003: [Validation] Create user missing name field', async () => {
    const response = await userApi.createUser({ job: 'leader' });
    expect(response.status()).toBe(201);
  });

  test('TC_REQRES_USER_004: [Validation] Create user missing job field', async () => {
    const response = await userApi.createUser({ name: 'morpheus' });
    expect(response.status()).toBe(201);
  });

  test('TC_REQRES_USER_005: [Security/XSS] Create user with XSS script in name', async () => {
    const xssPayload = { name: "<script>alert('XSS')</script>", job: "tester" };
    const response = await userApi.createUser(xssPayload);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.name).toBe("<script>alert('XSS')</script>");
  });

  test('TC_REQRES_USER_006: [Happy Path] Get single user by valid ID', async () => {
    const response = await userApi.getUserById(2);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.id).toBe(2);
  });

  test('TC_REQRES_USER_007: [Negative] Get single user by non-existent ID', async () => {
    const response = await userApi.getUserById(23);
    expect(response.status()).toBe(404);
  });

  test('TC_REQRES_USER_008: [Happy Path] Update user full details via PUT', async () => {
    const updatePayload = { name: 'morpheus', job: 'zion resident' };
    const response = await userApi.updateUser(2, updatePayload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe('morpheus');
  });

  test('TC_REQRES_USER_009: [Happy Path] Partial update user via PATCH', async () => {
    const patchPayload = { job: 'zion resident' };
    const response = await userApi.patchUser(2, patchPayload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.job).toBe('zion resident');
  });

  test('TC_REQRES_USER_010: [Happy Path] Delete user by valid ID', async () => {
    const response = await userApi.deleteUser(2);
    expect(response.status()).toBe(204);
  });

  test('TC_REQRES_USER_011: [Boundary] List users with large page number', async () => {
    const response = await userApi.listUsers(9999);
    expect(response.status()).toBe(200);
  });
});
