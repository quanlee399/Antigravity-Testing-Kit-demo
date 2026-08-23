import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApi } from './base-api';

export class PetApi extends BaseApi {
  constructor(request: APIRequestContext, baseUrl?: string, apiKey?: string) {
    super(request, baseUrl, apiKey);
  }

  async addPet(pet: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/pet`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json', ...headers }),
      data: pet,
    });
  }

  async updatePet(pet: any, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/pet`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/json', ...headers }),
      data: pet,
    });
  }

  async findPetsByStatus(status: string | string[]): Promise<APIResponse> {
    const statusParam = Array.isArray(status) ? status.join(',') : status;
    return this.request.get(`${this.baseUrl}/pet/findByStatus`, {
      headers: this.getDefaultHeaders(),
      params: { status: statusParam },
    });
  }

  async findPetsByTags(tags: string | string[]): Promise<APIResponse> {
    const tagsParam = Array.isArray(tags) ? tags.join(',') : tags;
    return this.request.get(`${this.baseUrl}/pet/findByTags`, {
      headers: this.getDefaultHeaders(),
      params: { tags: tagsParam },
    });
  }

  async getPetById(petId: number | string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/pet/${petId}`, {
      headers: this.getDefaultHeaders(headers),
    });
  }

  async updatePetWithForm(petId: number | string, name?: string, status?: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/pet/${petId}`, {
      headers: this.getDefaultHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      form: {
        ...(name && { name }),
        ...(status && { status }),
      },
    });
  }

  async deletePet(petId: number | string, apiKey?: string): Promise<APIResponse> {
    const headers: Record<string, string> = {};
    if (apiKey !== undefined) {
      headers['api_key'] = apiKey;
    } else {
      headers['api_key'] = this.apiKey;
    }

    return this.request.delete(`${this.baseUrl}/pet/${petId}`, {
      headers,
    });
  }

  async uploadImage(petId: number | string, additionalMetadata?: string, fileBuffer?: { name: string; mimeType: string; buffer: Buffer }): Promise<APIResponse> {
    const multipartData: Record<string, any> = {};
    if (additionalMetadata) {
      multipartData['additionalMetadata'] = additionalMetadata;
    }
    if (fileBuffer) {
      multipartData['file'] = fileBuffer;
    }

    return this.request.post(`${this.baseUrl}/pet/${petId}/uploadImage`, {
      headers: { 'api_key': this.apiKey },
      multipart: multipartData,
    });
  }
}
