import { APIRequestContext } from '@playwright/test';

export class BaseApi {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected apiKey: string;

  constructor(request: APIRequestContext, baseUrl = 'https://petstore.swagger.io/v2', apiKey = 'special-key') {
    this.request = request;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  protected getDefaultHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'api_key': this.apiKey,
      'Accept': 'application/json',
      ...extraHeaders,
    };
  }
}
