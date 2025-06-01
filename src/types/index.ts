// src/types/index.ts
export interface StoredAuth {
  token: string;
  refreshToken: string;
  userId: number;
  email: string;
  username: string;
}
export interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  email: string;
  username: string;
}
export interface AuthError {
  detail: string;
  non_field_errors?: string[];
  email?: string[];
  password?: string[];
}
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  school: string;
  department: string;
  profile_picture?: string;
  is_staff: boolean;
}

export interface Lesson {
  id: number;
  title: string;
  subject: string;
  day: number;
  start_time: string;
  end_time: string;
  location: string;
  notes?: string;
  color: string;
  is_recurring: boolean;
  attachments: LessonAttachment[];
  exceptions: LessonException[];

}

export interface LessonAttachment {
  id: number;
  name: string;
  file: string;
  uploaded_at: string;
}

export interface LessonException {
  id: number;
  date: string;
  exception_type: 'cancelled' | 'rescheduled' | 'modified';
  start_time?: string;
  end_time?: string;
  location?: string;
  notes?: string;
}

export interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'urgent';
  lesson_id?: number;
  lesson_title?: string;
}

export interface Lesson {
  id: number;
  title: string;
  subject: string;
  start_time: string; // assuming ISO or "HH:mm"
  end_time: string;
  location: string;
 
}
