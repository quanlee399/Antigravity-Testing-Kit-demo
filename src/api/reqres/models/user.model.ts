export interface User {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  name?: string;
  job?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
}

export interface UserResponse {
  data?: User;
  support?: {
    url: string;
    text: string;
  };
}

export interface UserMutationResponse {
  id?: string | number;
  name?: string;
  job?: string;
  createdAt?: string;
  updatedAt?: string;
}
