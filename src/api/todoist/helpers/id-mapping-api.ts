import { APIRequestContext, APIResponse } from '@playwright/test';
import { TodoistBaseApi } from './base-api';

export class TodoistIdMappingApi extends TodoistBaseApi {
  constructor(request: APIRequestContext, token?: string, baseUrl?: string) {
    super(request, token, baseUrl);
  }

  /**
   * Translates IDs from v1 to v2 or vice versa for a specified object type.
   * GET /api/v1/id_mappings/{obj_name}/{obj_ids}
   */
  async getIdMappings(
    objName: string,
    objIds: string,
    customToken?: string,
    extraHeaders: Record<string, string> = {}
  ): Promise<APIResponse> {
    const encodedObjName = encodeURIComponent(objName);
    const encodedObjIds = encodeURIComponent(objIds);
    return this.request.get(`${this.baseUrl}/id_mappings/${encodedObjName}/${encodedObjIds}`, {
      headers: this.getDefaultHeaders(customToken, extraHeaders),
    });
  }

  /**
   * Raw endpoint call for testing unencoded or raw path scenarios (e.g. SQL Injection / Path Traversal / Missing Params)
   */
  async getIdMappingsRawPath(
    rawPath: string,
    customToken?: string,
    extraHeaders: Record<string, string> = {}
  ): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/${rawPath}`, {
      headers: this.getDefaultHeaders(customToken, extraHeaders),
    });
  }
}
