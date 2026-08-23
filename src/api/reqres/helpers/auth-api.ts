import { APIRequestContext, APIResponse } from '@playwright/test';
import { ReqresBaseApi } from './base-api';

export class ReqresAuthApi extends ReqresBaseApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async register(authPayload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/register`, {
      headers: this.getDefaultHeaders(),
      data: authPayload,
    });
  }

  async login(authPayload: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/login`, {
      headers: this.getDefaultHeaders(),
      data: authPayload,
    });
  }

  async logout(): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/logout`, {
      headers: this.getDefaultHeaders(),
      data: {},
    });
  }
}
