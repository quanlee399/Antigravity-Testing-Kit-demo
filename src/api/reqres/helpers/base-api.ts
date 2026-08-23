import { APIRequestContext } from '@playwright/test';

export class ReqresBaseApi {
  protected request: APIRequestContext;
  protected baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = 'https://reqres.in/api') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  protected getDefaultHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extraHeaders,
    };
  }
}
