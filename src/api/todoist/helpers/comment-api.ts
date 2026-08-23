import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistCommentApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async listComments(taskId?: string, projectId?: string): Promise<APIResponse> {
    const params: Record<string, any> = {};
    if (taskId) params['task_id'] = taskId;
    if (projectId) params['project_id'] = projectId;

    return this.request.get(`${this.baseUrl}/comments`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async createComment(payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/comments`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getCommentById(id: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/comments/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateComment(id: string, payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/comments/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async deleteComment(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/comments/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
