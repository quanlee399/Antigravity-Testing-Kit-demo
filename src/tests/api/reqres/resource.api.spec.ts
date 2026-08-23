import { test, expect } from '@playwright/test';
import { ReqresResourceApi } from '../../../api/reqres/helpers/resource-api';

test.describe('ReqRes API - Resource (Unknown) Endpoints', () => {
  let resourceApi: ReqresResourceApi;

  test.beforeEach(({ request }) => {
    resourceApi = new ReqresResourceApi(request);
  });

  test('TC_REQRES_RES_001: [Happy Path] List unknown resources (colors)', async () => {
    const response = await resourceApi.listResources();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('TC_REQRES_RES_002: [Happy Path] Get resource by valid ID', async () => {
    const response = await resourceApi.getResourceById(2);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.data.id).toBe(2);
  });

  test('TC_REQRES_RES_003: [Negative] Get resource by non-existent ID', async () => {
    const response = await resourceApi.getResourceById(23);
    expect(response.status()).toBe(404);
  });

  test('TC_REQRES_RES_004: [Negative] Get resource by invalid string ID', async () => {
    const response = await resourceApi.getResourceById('invalid_string_id');
    expect(response.status()).toBe(404);
  });
});
