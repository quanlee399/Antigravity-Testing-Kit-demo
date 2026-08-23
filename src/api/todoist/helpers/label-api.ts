import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistLabelApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async listLabels(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/labels`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async createLabel(payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/labels`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getLabelById(id: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/labels/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateLabel(id: string, payload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/labels/${id}`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async deleteLabel(id: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/labels/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
