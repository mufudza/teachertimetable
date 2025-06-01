import api from './axios';
import { Lesson } from '@/types';



/**
 * Fetch all lessons
 */
export async function getLessons(): Promise<Lesson[]> {
  const response = await api.get<{ results: Lesson[] }>('/lessons/');
  return response.data.results;
}

/**
 * Fetch a single lesson by ID
 */
export async function getLesson(id: number): Promise<Lesson> {
  const response = await api.get<Lesson>(`/lessons/${id}/`);
  return response.data;
}

/**
 * Create a new lesson
 */
export async function createLesson(lessonData: Partial<Lesson>): Promise<Lesson> {
  const formattedData = {
    ...lessonData,
    start_time: lessonData.start_time,
    end_time: lessonData.end_time,
  };

  const response = await api.post<Lesson>('/lessons/', formattedData);
  return response.data;
}

/**
 * Update an existing lesson
 */
export async function updateLesson(id: number, lessonData: Partial<Lesson>): Promise<Lesson> {
  const response = await api.put<Lesson>(`/lessons/${id}/`, lessonData);
  return response.data;
}

/**
 * Delete a lesson by ID
 */
export async function deleteLesson(id: number): Promise<void> {
  await api.delete(`/lessons/${id}/`);
}

/**
 * Get lessons scheduled for a specific day of the week (Monday=1, Sunday=7)
 */
export async function getTodaysLessons(dayOfWeek: number): Promise<Lesson[]> {
  const response = await api.get<{ results: Lesson[] }>(`/lessons/day/${dayOfWeek}/`);
  return response.data.results;
}
