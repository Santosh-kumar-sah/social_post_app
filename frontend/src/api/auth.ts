import { apiClient } from './client';
import { AuthResponse, LoginCredentials, SignupCredentials } from '../types';

export const signupApi = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
  return response.data;
};

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async (): Promise<AuthResponse> => {
  const response = await apiClient.get<AuthResponse>('/auth/me');
  return response.data;
};
