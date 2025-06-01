import { useState } from 'react';
import { createLesson } from '@/api/lessons';
import { Lesson } from '@/types';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonCreated: (lesson: Lesson) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLORS = ['indigo', 'blue', 'green', 'red', 'purple', 'pink', 'yellow', 'orange', 'teal'];

export default function LessonModal({ isOpen, onClose, onLessonCreated }: LessonModalProps) {
  const [form, setForm] = useState({
    title: '',
    subject: '',
    day: new Date().getDay(),
    start_time: '',
    end_time: '',
    location: '',
    notes: '',
    color: 'indigo',
    is_recurring: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : undefined;
    
    if (name === 'end_time' && form.start_time && value) {
      // Validate that end time is after start time
      if (value <= form.start_time) {
        setTimeError('End time must be after start time');
      } else {
        setTimeError(null);
      }
    }
    
    if (name === 'start_time' && form.end_time && value) {
      // Validate when start time changes
      if (form.end_time <= value) {
        setTimeError('End time must be after start time');
      } else {
        setTimeError(null);
      }
    }
    
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    if (form.end_time <= form.start_time) {
      setTimeError('End time must be after start time');
      return;
    }
    
    setLoading(true);
    setError(null);
    setTimeError(null);
    
    try {
      const lesson = await createLesson(form);
      onLessonCreated(lesson);
      onClose();
      setForm({
        title: '',
        subject: '',
        day: new Date().getDay(),
        start_time: '',
        end_time: '',
        location: '',
        notes: '',
        color: 'indigo',
        is_recurring: true
      });
    } catch (err: any) {
      const errorData = err.response?.data;
      console.error('Create lesson error:', errorData);
      setError(
        typeof errorData === 'string'
          ? errorData
          : errorData?.detail || 'Failed to create lesson.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Subject"
            className="w-full border p-2 rounded"
            required
          />
          <label className="block">
            Day
            <select
              name="day"
              value={form.day}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              {DAYS.map((d, i) => (
                <option value={i} key={d}>{d}</option>
              ))}
            </select>
          </label>
          <div>
            <label className="block mb-1">Start Time</label>
            <input
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              type="time"
              className="w-full border p-2 rounded"
              required
              step="60"
              placeholder="Start Time"
            />
          </div>
          <div>
            <label className="block mb-1">End Time</label>
            <input
             title='End Time'
            
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              type="time"
              className="w-full border p-2 rounded"
              required
              step="60"
            />
            {timeError && <p className="text-red-500 text-sm mt-1">{timeError}</p>}
          </div>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border p-2 rounded"
            required
          />
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="w-full border p-2 rounded"
          />
          <label className="block">
            Color
            <select
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              {COLORS.map((c) => (
                <option value={c} key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleChange}
              title="Recurring"
              aria-label="Recurring"
              placeholder="Recurring"
            />
            <span className="ml-2">Recurring</span>
          </label>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary-600 text-white"
              disabled={loading || !!timeError}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}