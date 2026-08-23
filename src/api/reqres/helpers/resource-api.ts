import { APIRequestContext, APIResponse } from '@playwright/test';
import { ReqresBaseApi } from './base-api';

export class ReqresResourceApi extends ReqresBaseApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async listResources(page?: number | string): Promise<APIResponse> {
    const params: Record<string, any> = {};
    if (page !== undefined) params['page'] = page;

    return this.request.get(`${this.baseUrl}/unknown`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async getResourceById(id: number | string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/unknown/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
