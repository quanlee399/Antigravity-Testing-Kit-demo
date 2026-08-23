import { test, expect } from '@playwright/test';
import { TodoistSectionApi } from '../../../api/todoist/helpers/section-api';
import { TodoistTestDataGenerator } from '../../../api/todoist/helpers/test-data';

test.describe('Todoist API - Sections Module Endpoints', () => {
  let sectionApi: TodoistSectionApi;
  let createdSectionId: string;

  test.beforeEach(({ request }) => {
    sectionApi = new TodoistSectionApi(request);
  });

  test('TC_TODOIST_SEC_001: [Happy Path] List sections', async () => {
    const response = await sectionApi.listSections();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('TC_TODOIST_SEC_002: [Happy Path] Create section in valid project', async () => {
    const sectionName = TodoistTestDataGenerator.generateRandomSectionName();
    const response = await sectionApi.createSection({ project_id: '2203306160', name: sectionName });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(sectionName);
    createdSectionId = body.id;
  });

  test('TC_TODOIST_SEC_003: [Validation] Create section missing required project_id', async () => {
    const response = await sectionApi.createSection({ name: 'Sprint 1' });
    expect(response.status()).toBe(400);
  });

  test('TC_TODOIST_SEC_004: [Happy Path] Get section by valid ID', async () => {
    const targetId = createdSectionId || '7025';
    const response = await sectionApi.getSectionById(targetId);
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_SEC_005: [Happy Path] Update section name', async () => {
    const targetId = createdSectionId || '7025';
    const response = await sectionApi.updateSection(targetId, { name: 'Sprint 1 Updated' });
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_SEC_006: [Happy Path] Delete section by ID', async () => {
    const targetId = createdSectionId || '7025';
    const response = await sectionApi.deleteSection(targetId);
    expect(response.status()).toBe(204);
  });
});
