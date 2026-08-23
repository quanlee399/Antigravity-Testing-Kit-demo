import { test, expect } from '@playwright/test';
import { TodoistProjectApi } from '../../../api/todoist/helpers/project-api';
import { TodoistTestDataGenerator } from '../../../api/todoist/helpers/test-data';

test.describe('Todoist API - Projects Module Endpoints', () => {
  let projectApi: TodoistProjectApi;
  let createdProjectId: string;

  test.beforeEach(({ request }) => {
    projectApi = new TodoistProjectApi(request);
  });

  test('TC_TODOIST_PROJ_001: [Happy Path] List all user projects', async () => {
    const response = await projectApi.listProjects();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('TC_TODOIST_PROJ_002: [Happy Path] Create new project with valid name', async () => {
    const projName = TodoistTestDataGenerator.generateRandomProjectName();
    const response = await projectApi.createProject({ name: projName });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.name).toBe(projName);
    createdProjectId = body.id;
  });

  test('TC_TODOIST_PROJ_003: [Validation] Create project missing required name field', async () => {
    const response = await projectApi.createProject({});
    expect(response.status()).toBe(400);
  });

  test('TC_TODOIST_PROJ_004: [Happy Path] Get project by valid ID', async () => {
    const targetId = createdProjectId || '2203306160';
    const response = await projectApi.getProjectById(targetId);
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_PROJ_005: [Negative] Get project by non-existent ID', async () => {
    const response = await projectApi.getProjectById('999999999999');
    expect(response.status()).toBe(404);
  });

  test('TC_TODOIST_PROJ_006: [Happy Path] Update project name', async () => {
    const targetId = createdProjectId || '2203306160';
    const response = await projectApi.updateProject(targetId, { name: 'Updated_Project_Name' });
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_PROJ_007: [Happy Path] Archive project', async () => {
    const targetId = createdProjectId || '2203306160';
    const response = await projectApi.archiveProject(targetId);
    expect(response.status()).toBe(204);
  });

  test('TC_TODOIST_PROJ_008: [Happy Path] Unarchive project', async () => {
    const targetId = createdProjectId || '2203306160';
    const response = await projectApi.unarchiveProject(targetId);
    expect(response.status()).toBe(204);
  });

  test('TC_TODOIST_PROJ_009: [Happy Path] Delete project by ID', async () => {
    const targetId = createdProjectId || '2203306160';
    const response = await projectApi.deleteProject(targetId);
    expect(response.status()).toBe(204);
  });
});
