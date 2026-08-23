import { test, expect } from '@playwright/test';
import { TodoistLabelApi } from '../../../api/todoist/helpers/label-api';
import { TodoistTestDataGenerator } from '../../../api/todoist/helpers/test-data';

test.describe('Todoist API - Labels Module Endpoints', () => {
  let labelApi: TodoistLabelApi;
  let createdLabelId: string;

  test.beforeEach(({ request }) => {
    labelApi = new TodoistLabelApi(request);
  });

  test('TC_TODOIST_LBL_001: [Happy Path] List all user labels', async () => {
    const response = await labelApi.listLabels();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('TC_TODOIST_LBL_002: [Happy Path] Create label with valid name', async () => {
    const labelName = TodoistTestDataGenerator.generateRandomLabelName();
    const response = await labelApi.createLabel({ name: labelName });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(labelName);
    createdLabelId = body.id;
  });

  test('TC_TODOIST_LBL_003: [Validation] Create label missing name', async () => {
    const response = await labelApi.createLabel({});
    expect(response.status()).toBe(400);
  });

  test('TC_TODOIST_LBL_004: [Happy Path] Get label by ID', async () => {
    const targetId = createdLabelId || '2156154810';
    const response = await labelApi.getLabelById(targetId);
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_LBL_005: [Happy Path] Update label name', async () => {
    const targetId = createdLabelId || '2156154810';
    const response = await labelApi.updateLabel(targetId, { name: 'Urgent_Updated' });
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_LBL_006: [Happy Path] Delete label by ID', async () => {
    const targetId = createdLabelId || '2156154810';
    const response = await labelApi.deleteLabel(targetId);
    expect(response.status()).toBe(204);
  });
});
