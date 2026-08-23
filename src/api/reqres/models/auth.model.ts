export interface AuthRequest {
  email?: string;
  password?: string;
}

export interface RegisterResponse {
  id?: number;
  token?: string;
  error?: string;
}

export interface LoginResponse {
  token?: string;
  error?: string;
}

export interface ErrorResponse {
  error: string;
}
