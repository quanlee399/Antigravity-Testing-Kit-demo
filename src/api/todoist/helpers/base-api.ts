import { APIRequestContext } from '@playwright/test';

export class TodoistBaseApi {
  protected request: APIRequestContext;
  protected baseUrl: string;
  protected token: string;

  constructor(request: APIRequestContext, token = process.env.TODOIST_API_TOKEN || 'dummy_todoist_token_123', baseUrl = 'https://api.todoist.com/api/v1') {
    this.request = request;
    this.token = token;
    this.baseUrl = baseUrl;
  }

  protected getDefaultHeaders(customToken?: string, extraHeaders: Record<string, string> = {}): Record<string, string> {
    const bearerToken = customToken !== undefined ? customToken : this.token;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extraHeaders,
    };
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }
    return headers;
  }
}
