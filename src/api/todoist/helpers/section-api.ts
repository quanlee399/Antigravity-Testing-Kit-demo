import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistSectionApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async listSections(projectId?: string): Promise<APIResponse> {
    const params: Record<string, any> = {};
    if (projectId) params['project_id'] = projectId;

    return this.request.get(`${this.baseUrl}/sections`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async createSection(payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/sections`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getSectionById(id: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/sections/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateSection(id: string, payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/sections/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async deleteSection(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/sections/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
