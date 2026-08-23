import { test, expect } from '@playwright/test';
import { TodoistTaskApi } from '../../../api/todoist/helpers/task-api';
import { TodoistTestDataGenerator } from '../../../api/todoist/helpers/test-data';

test.describe('Todoist API - Tasks Module Endpoints', () => {
  let taskApi: TodoistTaskApi;
  let createdTaskId: string;

  test.beforeEach(({ request }) => {
    taskApi = new TodoistTaskApi(request);
  });

  test('TC_TODOIST_TASK_001: [Happy Path] List all active tasks', async () => {
    const response = await taskApi.listTasks();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('TC_TODOIST_TASK_002: [Happy Path] Create task with valid content and due date', async () => {
    const taskContent = TodoistTestDataGenerator.generateRandomTaskContent();
    const response = await taskApi.createTask({ content: taskContent, due_string: 'tomorrow' });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.content).toBe(taskContent);
    createdTaskId = body.id;
  });

  test('TC_TODOIST_TASK_003: [Validation] Create task missing required content', async () => {
    const response = await taskApi.createTask({ due_string: 'tomorrow' });
    expect(response.status()).toBe(400);
  });

  test('TC_TODOIST_TASK_004: [Security/XSS] Create task with XSS script in content', async () => {
    const xssPayload = { content: "<script>alert('XSS')</script>" };
    const response = await taskApi.createTask(xssPayload);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.content).toBe("<script>alert('XSS')</script>");
  });

  test('TC_TODOIST_TASK_005: [Happy Path] Get task details by valid ID', async () => {
    const targetId = createdTaskId || '2999794622';
    const response = await taskApi.getTaskById(targetId);
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_TASK_006: [Negative] Get task details by non-existent ID', async () => {
    const response = await taskApi.getTaskById('999999999999');
    expect(response.status()).toBe(404);
  });

  test('TC_TODOIST_TASK_007: [Happy Path] Update task content and priority', async () => {
    const targetId = createdTaskId || '2999794622';
    const response = await taskApi.updateTask(targetId, { content: 'Buy organic milk', priority: 4 });
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_TASK_008: [Happy Path] Close / Complete task', async () => {
    const targetId = createdTaskId || '2999794622';
    const response = await taskApi.closeTask(targetId);
    expect(response.status()).toBe(204);
  });

  test('TC_TODOIST_TASK_009: [Happy Path] Reopen completed task', async () => {
    const targetId = createdTaskId || '2999794622';
    const response = await taskApi.reopenTask(targetId);
    expect(response.status()).toBe(204);
  });

  test('TC_TODOIST_TASK_010: [Happy Path] Delete task by ID', async () => {
    const targetId = createdTaskId || '2999794622';
    const response = await taskApi.deleteTask(targetId);
    expect(response.status()).toBe(204);
  });
});
