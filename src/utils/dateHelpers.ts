/**
 * Utility functions for date and time handling
 */

/**
 * Formats time from 24-hour format to 12-hour format
 * @param time Time in 24-hour format (HH:MM)
 * @returns Time in 12-hour format (h:MM AM/PM)
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Gets the day name from a day number
 * @param dayNumber Day number (0-6, where 0 is Sunday)
 * @returns Day name
 */
export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber] || '';
}

/**
 * Checks if a date is today
 * @param date Date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}