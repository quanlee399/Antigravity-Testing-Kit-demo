import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseHerokuappApi } from './base-api';

export class BookingHerokuappApi extends BaseHerokuappApi {
  constructor(request: APIRequestContext, baseUrl?: string) {
    super(request, baseUrl);
  }

  async createBooking(booking: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/booking`, {
      headers: this.getDefaultHeaders(),
      data: booking,
    });
  }

  async getBookingIds(params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/booking`, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  async getBookingById(id: number | string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/booking/${id}`, {
      headers: this.getDefaultHeaders(),
    });
  }

  async updateBooking(id: number | string, booking: any, token?: string, authHeader?: string): Promise<APIResponse> {
    const headers = this.getDefaultHeaders();
    if (token) {
      headers['Cookie'] = `token=${token}`;
    }
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return this.request.put(`${this.baseUrl}/booking/${id}`, {
      headers,
      data: booking,
    });
  }

  async partialUpdateBooking(id: number | string, partialData: any, token?: string, authHeader?: string): Promise<APIResponse> {
    const headers = this.getDefaultHeaders();
    if (token) {
      headers['Cookie'] = `token=${token}`;
    }
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return this.request.patch(`${this.baseUrl}/booking/${id}`, {
      headers,
      data: partialData,
    });
  }

  async deleteBooking(id: number | string, token?: string, authHeader?: string): Promise<APIResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Cookie'] = `token=${token}`;
    }
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return this.request.delete(`${this.baseUrl}/booking/${id}`, {
      headers,
    });
  }
}
