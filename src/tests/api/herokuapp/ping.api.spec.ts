import { test, expect } from '@playwright/test';
import { PingHerokuappApi } from '../../../api/herokuapp/helpers/ping-api';

test.describe('Restful-Booker API - Health Check Ping Endpoint', () => {
  let pingApi: PingHerokuappApi;

  test.beforeEach(({ request }) => {
    pingApi = new PingHerokuappApi(request);
  });

  test('TC_PING_001: [Happy Path] Health check ping server status', async () => {
    const response = await pingApi.ping();
    expect(response.status()).toBe(201);

    const body = await response.text();
    expect(body).toBe('Created');
  });
});
