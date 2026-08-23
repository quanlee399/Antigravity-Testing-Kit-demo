import { test, expect } from '@playwright/test';
import { TodoistIdMappingApi } from '../../../api/todoist/helpers/id-mapping-api';
import { IdMapping, ObjNameType } from '../../../api/todoist/models/id-mapping.model';

test.describe('Todoist API - ID Mappings Endpoint [GET /api/v1/id_mappings/{obj_name}/{obj_ids}]', () => {
  let api: TodoistIdMappingApi;
  const MAX_RESPONSE_TIME_MS = 2000;

  test.beforeEach(({ request }) => {
    api = new TodoistIdMappingApi(request);
  });

  async function assertCommonMetrics(response: any, expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
    const contentType = response.headers()['content-type'] || '';
    expect(contentType).toContain('application/json');
  }

  // ==========================================
  // 1. HTTP 200 SUCCESS - HAPPY PATH & PARAMETERIZED
  // ==========================================
  test.describe('200 OK - Happy Path & Data Provider Tests', () => {
    const validObjNames: ObjNameType[] = [
      'sections',
      'tasks',
      'comments',
      'reminders',
      'location_reminders',
      'projects',
    ];

    for (const objName of validObjNames) {
      test(`TC_IDMAP_200_001: [Happy Path] Get ID mappings for valid enum obj_name '${objName}'`, async () => {
        const startTime = Date.now();
        // Uses valid Base32 encoded string format (a-z, 2-7)
        const response = await api.getIdMappings(objName, '6vfwjjjfg2xqx6pa');
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
        await assertCommonMetrics(response, 200);

        const body: IdMapping[] = await response.json();
        expect(Array.isArray(body)).toBe(true);
      });
    }

    test('TC_IDMAP_200_002: [Happy Path] Translate multiple valid Base32 comma-separated IDs', async () => {
      const commaSeparatedIds = '6vfwjjjfg2xqx6pa,6wmvpf2hn2jp6mc2';
      const startTime = Date.now();
      const response = await api.getIdMappings('tasks', commaSeparatedIds);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
      await assertCommonMetrics(response, 200);

      const body: IdMapping[] = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('TC_IDMAP_200_003: [Happy Path - Boundary] Non-existent valid Base32 IDs return an empty array', async () => {
      const nonExistentId = 'nonexistentbase32id';
      const startTime = Date.now();
      const response = await api.getIdMappings('tasks', nonExistentId);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
      await assertCommonMetrics(response, 200);

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });

  // ==========================================
  // 2. HTTP 400 BAD REQUEST - VALIDATION ERRORS
  // ==========================================
  test.describe('400 Bad Request - Validation Scenarios', () => {
    test('TC_IDMAP_400_001: [Validation] Invalid obj_name enum', async () => {
      const startTime = Date.now();
      const response = await api.getIdMappings('invalid_object', '6vfwjjjfg2xqx6pa');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
      await assertCommonMetrics(response, 400);
    });

    test('TC_IDMAP_400_002: [Validation] Non-Base32 digits in obj_ids (digits 0,1,8,9 or uppercase)', async () => {
      const startTime = Date.now();
      // '6VfWjjjFg2xqX6Pa,6WMVPf8Hn8JP6mC8,918273645' contains '9', '8', '1' and uppercase letters
      const response = await api.getIdMappings('tasks', '6VfWjjjFg2xqX6Pa,6WMVPf8Hn8JP6mC8,918273645');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
      await assertCommonMetrics(response, 400);

      const body = await response.json();
      expect(body.error_tag).toBe('INVALID_ARGUMENT_VALUE');
      expect(JSON.stringify(body.error_extra)).toContain('Non-base32 digit found');
    });
  });

  // ==========================================
  // 3. HTTP 401 UNAUTHORIZED - AUTHENTICATION ERRORS
  // ==========================================
  test.describe('401 Unauthorized - Authentication Scenarios', () => {
    test('TC_IDMAP_401_001: [Auth] Request without Authorization header', async () => {
      const startTime = Date.now();
      const response = await api.getIdMappings('tasks', '6vfwjjjfg2xqx6pa', '');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(MAX_RESPONSE_TIME_MS);
      await assertCommonMetrics(response, 401);
    });
  });
});
