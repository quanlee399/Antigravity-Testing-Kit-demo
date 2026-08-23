import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistTaskApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async listTasks(projectId?: string): Promise<APIResponse> {
    const params: Record<string, any> = {};
    if (projectId) params['project_id'] = projectId;

    return this.request.get(`${this.baseUrl}/tasks`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async createTask(payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/tasks`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getTaskById(id: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/tasks/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateTask(id: string, payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/tasks/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async closeTask(id: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/tasks/${id}/close`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async reopenTask(id: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/tasks/${id}/reopen`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async deleteTask(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/tasks/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
