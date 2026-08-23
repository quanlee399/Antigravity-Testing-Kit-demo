import { test, expect } from '@playwright/test';
import { TodoistCommentApi } from '../../../api/todoist/helpers/comment-api';
import { TodoistTestDataGenerator } from '../../../api/todoist/helpers/test-data';

test.describe('Todoist API - Comments Module Endpoints', () => {
  let commentApi: TodoistCommentApi;
  let createdCommentId: string;

  test.beforeEach(({ request }) => {
    commentApi = new TodoistCommentApi(request);
  });

  test('TC_TODOIST_COMM_001: [Happy Path] List comments for a task', async () => {
    const response = await commentApi.listComments('2999794622');
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_COMM_002: [Happy Path] Create comment for task', async () => {
    const commentText = TodoistTestDataGenerator.generateRandomCommentContent();
    const response = await commentApi.createComment({ task_id: '2999794622', content: commentText });
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.content).toBe(commentText);
    createdCommentId = body.id;
  });

  test('TC_TODOIST_COMM_003: [Validation] Create comment missing content', async () => {
    const response = await commentApi.createComment({ task_id: '2999794622' });
    expect(response.status()).toBe(400);
  });

  test('TC_TODOIST_COMM_004: [Happy Path] Get comment by ID', async () => {
    const targetId = createdCommentId || '2999794622';
    const response = await commentApi.getCommentById(targetId);
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_COMM_005: [Happy Path] Update comment content', async () => {
    const targetId = createdCommentId || '2999794622';
    const response = await commentApi.updateComment(targetId, { content: 'Updated comment text' });
    expect(response.status()).toBe(200);
  });

  test('TC_TODOIST_COMM_006: [Happy Path] Delete comment by ID', async () => {
    const targetId = createdCommentId || '2999794622';
    const response = await commentApi.deleteComment(targetId);
    expect(response.status()).toBe(204);
  });
});
