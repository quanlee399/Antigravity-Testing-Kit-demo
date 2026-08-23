import { APIRequestContext, APIResponse } from '@playwright/test';
import { ReqresBaseApi } from './base-api';

export class ReqresUserApi extends ReqresBaseApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async listUsers(page?: number | string): Promise<APIResponse> {
    const params: Record<string, any> = {};
    if (page !== undefined) params['page'] = page;

    return this.request.get(`${this.baseUrl}/users`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async createUser(userPayload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/users`, {
      headers: this.getDefaultHeaders(),
      data: userPayload,
    });
  }

  async getUserById(id: number | string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateUser(id: number | string, userPayload: any): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/users/${id}`, {
      headers: this.getDefaultHeaders(),
      data: userPayload,
    });
  }

  async patchUser(id: number | string, userPayload: any): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}/users/${id}`, {
      headers: this.getDefaultHeaders(),
      data: userPayload,
    });
  }

  async deleteUser(id: number | string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/users/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
