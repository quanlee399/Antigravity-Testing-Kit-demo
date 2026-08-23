import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistProjectApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async listProjects(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/projects`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async createProject(payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/projects`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getProjectById(id: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/projects/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateProject(id: string, payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/projects/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async archiveProject(id: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/projects/${id}/archive`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async unarchiveProject(id: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/projects/${id}/unarchive`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async deleteProject(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/projects/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
