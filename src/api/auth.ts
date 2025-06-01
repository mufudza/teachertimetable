import api from './axios';
import { User } from '@/types';

interface LoginResponse {
  access: string;
  refresh: string;
  user_id: number;
  email: string;
  username: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  school: string;
  department: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login/', { email, password });
  return response.data;
}

export async function register(data: RegisterData) {
  const response = await api.post('/auth/register/', data);
  return response.data;
}

export async function getProfile() {
  const response = await api.get<User>('/auth/profile/');
  return response.data;
}

export async function updateProfile(data: Partial<User>) {
  const response = await api.patch<User>('/auth/profile/', data);
  return response.data;
}

export async function changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
  const response = await api.patch('/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
    new_password2: confirmPassword,
  });
  return response.data;
}

export async function refreshToken(token: string) {
  const response = await api.post<{ access: string }>('/auth/refresh/', {
    refresh: token,
  });
  return response.data;
}

export async function logout(refreshToken: string) {
  await api.post('/auth/logout/', { refresh: refreshToken });
}