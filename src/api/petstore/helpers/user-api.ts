import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from './base-api';

export class UserApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl?: string, apiKey?: string) {
    super(request, baseUrl, apiKey);
  }

  async createUser(user: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/user`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
      data: user,
    });
  }

  async createUsersWithArray(users: any[]): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/user/createWithArray`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
      data: users,
    });
  }

  async createUsersWithList(users: any[]): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/user/createWithList`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
      data: users,
    });
  }

  async login(username?: string, password?: string): Promise<APIResponse> {
    const params: Record<string, string> = {};
    if (username !== undefined) params['username'] = username;
    if (password !== undefined) params['password'] = password;

    return this.request.get(`${this.baseUrl}/user/login`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async logout(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/user/logout`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async getUserByName(username: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/user/${username}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateUser(username: string, user: any): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/user/${username}`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
      data: user,
    });
  }

  async deleteUser(username: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/user/${username}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
