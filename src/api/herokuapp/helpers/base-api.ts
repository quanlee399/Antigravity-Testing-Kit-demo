import { APIRequestContext } from '@playwright/test';

export class BaseHerokuappApi {
  protected request: APIRequestContext;
  protected baseUrl: string;

  constructor(request: APIRequestContext, baseUrl = 'https://restful-booker.herokuapp.com') {
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
