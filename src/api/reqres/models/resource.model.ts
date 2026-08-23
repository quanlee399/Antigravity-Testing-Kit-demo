export interface Resource {
  id?: number;
  name?: string;
  year?: number;
  color?: string;
  pantone_value?: string;
}

export interface ResourceListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Resource[];
}

export interface ResourceResponse {
  data?: Resource;
  support?: {
    url: string;
    text: string;
  };
}
