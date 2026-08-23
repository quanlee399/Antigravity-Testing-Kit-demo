import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseHerokuappApi } from './base-api';

export class PingHerokuappApi extends BaseHerokuappApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async ping(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/ping`);
  }
}
