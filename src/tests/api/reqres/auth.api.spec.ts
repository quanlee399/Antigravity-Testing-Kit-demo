import { test, expect } from '@playwright/test';
import { ReqresAuthApi } from '../../../api/reqres/helpers/auth-api';
import { ReqresTestDataGenerator } from '../../../api/reqres/helpers/test-data';

test.describe('ReqRes API - Authentication Endpoints', () => {
  let authApi: ReqresAuthApi;

  test.beforeEach(({ request }) => {
    authApi = new ReqresAuthApi(request);
  });

  test('TC_REQRES_AUTH_001: [Happy Path] Register user with valid credentials', async () => {
    const credentials = ReqresTestDataGenerator.getValidRegisterCredentials();
    const response = await authApi.register(credentials);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
  });

  test('TC_REQRES_AUTH_002: [Validation] Register user missing password', async () => {
    const response = await authApi.register({ email: 'sydney@fife' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_003: [Validation] Register user missing email', async () => {
    const response = await authApi.register({ password: 'pistol' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_004: [Negative] Register un-registered email in ReqRes DB', async () => {
    const response = await authApi.register({ email: 'unregistered_email@test.com', password: 'pistol' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_005: [Happy Path] Login user with valid credentials', async () => {
    const credentials = ReqresTestDataGenerator.getValidLoginCredentials();
    const response = await authApi.login(credentials);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
  });

  test('TC_REQRES_AUTH_006: [Validation] Login user missing password', async () => {
    const response = await authApi.login({ email: 'peter@klaven' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_007: [Validation] Login user missing email', async () => {
    const response = await authApi.login({ password: 'cityslicka' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_008: [Negative] Login user with unregistered email', async () => {
    const response = await authApi.login({ email: 'unregistered_email@test.com', password: 'cityslicka' });
    expect(response.status()).toBe(400);
  });

  test('TC_REQRES_AUTH_009: [Happy Path] Logout user', async () => {
    const response = await authApi.logout();
    expect(response.status()).toBe(200);
  });
});
