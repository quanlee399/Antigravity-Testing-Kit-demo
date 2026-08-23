import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseHerokuappApi } from './base-api';
import { AuthCredentials } from '../models/auth.model';

export class AuthHerokuappApi extends BaseHerokuappApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async createToken(credentials?: AuthCredentials): Promise<APIResponse> {
    const payload = credentials !== undefined ? credentials : { username: 'admin', password: 'password123' };
    return this.request.post(`${this.baseUrl}/auth`, {
      headers: this.getDefaultHeaders(),
      data: payload,
    });
  }

  async getDynamicToken(): Promise<string> {
    const response = await this.createToken({ username: 'admin', password: 'password123' });
    const body = await response.json();
    return body.token;
  }
}
