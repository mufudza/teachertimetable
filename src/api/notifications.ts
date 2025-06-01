import api from './axios';
import { Notification } from '@/types';

export async function getNotifications() {
  const response = await api.get<{ results: Notification[] }>('/notifications/');
  return response.data.results;
}

export async function markAsRead(id: number) {
  const response = await api.patch(`/notifications/${id}/mark_read/`);
  return response.data;
}

export async function markAllAsRead() {
  const response = await api.post('/notifications/mark-all-read/');
  return response.data;
}

export async function getUnreadCount() {
  const response = await api.get<{ unread_count: number }>('/notifications/unread_count/');
  return response.data.unread_count;
}