import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistUserApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  async getUserProfile(overrideToken?: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/user`, {
      headers: this.getDefaultHeaders(overrideToken),
    });
  }
}
