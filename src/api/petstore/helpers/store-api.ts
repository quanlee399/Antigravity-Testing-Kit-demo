import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from './base-api';

export class StoreApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl?: string, apiKey?: string) {
    super(request, baseUrl, apiKey);
  }

  async getInventory(apiKey?: string): Promise<APIResponse> {
    const headers = this.getDefaultHeaders();
    if (apiKey !== undefined) {
      headers['api_key'] = apiKey;
    }
    return this.request.get(`${this.baseUrl}/store/inventory`, {
      headers,
    });
  }

  async placeOrder(order: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/store/order`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json' }),
      data: order,
    });
  }

  async getOrderById(orderId: number | string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/store/order/${orderId}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async deleteOrder(orderId: number | string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/store/order/${orderId}`, {
      headers: this.getDefaultHeaders(),
    });
  }
}
