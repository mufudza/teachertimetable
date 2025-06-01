import React from 'react';
import { Dialog } from '@headlessui/react';
import { UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { Lesson } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['indigo', 'blue', 'green', 'red', 'purple', 'pink', 'yellow', 'orange', 'teal'];

interface LessonForm {
  id?: number;
  title: string;
  subject: string;
  day: number | string;
  start_time: string;
  end_time: string;
  location: string;
  color: string;
  notes?: string;
}

interface LessonFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLesson: Lesson | null;
  onSubmit: (data: LessonForm) => void;
  register: UseFormRegister<LessonForm>;
  handleSubmit: UseFormHandleSubmit<LessonForm>;
  errors: FieldErrors<LessonForm>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onDelete: (id: number) => void;
  createError: Error | null;
  updateError: Error | null;
  deleteError: Error | null;
}

const LessonFormDialog: React.FC<LessonFormDialogProps> = ({
  isOpen,
  onClose,
  selectedLesson,
  onSubmit,
  register,
  handleSubmit,
  errors,
  isCreating,
  isUpdating,
  isDeleting,
  onDelete,
  createError,
  updateError,
  deleteError
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-indigo-200">
          <Dialog.Title className="text-lg font-bold mb-4 text-indigo-900">
            {selectedLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </Dialog.Title>

          {(createError || updateError || deleteError) && (
            <div className="mb-4 text-red-600 font-semibold p-3 bg-red-50 rounded-lg border border-red-200">
              {(createError || updateError || deleteError)?.message || 'Unknown error occurred'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-indigo-800 mb-1">Title</label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-indigo-800 mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                {...register('subject', { required: 'Subject is required' })}
                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label htmlFor="day" className="block text-sm font-medium text-indigo-800 mb-1">Day</label>
              <select
                id="day"
                {...register('day', { required: 'Day is required' })}
                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                defaultValue="0"
              >
                {DAYS.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
              {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day.message}</p>}
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label htmlFor="start_time" className="block text-sm font-medium text-indigo-800 mb-1">Start Time</label>
                <input
                  type="time"
                  id="start_time"
                  {...register('start_time', { required: 'Start time is required' })}
                  className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                  min="05:00"
                  max="18:30"
                  step="1800" // 30-minute intervals
                />
                {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
              </div>

              <div className="flex-1">
                <label htmlFor="end_time" className="block text-sm font-medium text-indigo-800 mb-1">End Time</label>
                <input
                  type="time"
                  id="end_time"
                  {...register('end_time', { required: 'End time is required' })}
                  className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                  min="05:00"
                  max="18:30"
                  step="1800" // 30-minute intervals
                />
                {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-indigo-800 mb-1">Location</label>
              <input
                type="text"
                id="location"
                {...register('location')}
                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-indigo-800 mb-1">Color</label>
              <div className="flex items-center space-x-2">
                <select 
                  id="color" 
                  {...register('color')} 
                  className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                >
                  {COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-indigo-800 mb-1">Notes</label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full px-3 py-1.5 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-y text-sm"
                rows={2}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              {selectedLesson && (
                <button
                  type="button"
                  onClick={() => selectedLesson.id && onDelete(selectedLesson.id)}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:scale-105 transition-transform duration-150"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}

              <div className="flex space-x-2 ml-auto">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-gray-300 text-gray-800 text-sm rounded-lg shadow hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={onClose}
                  disabled={isCreating || isUpdating || isDeleting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:scale-105 transition-transform duration-150"
                  disabled={isCreating || isUpdating || isDeleting}
                >
                  {selectedLesson ? (isUpdating ? 'Saving...' : 'Save') : (isCreating ? 'Creating...' : 'Create')}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LessonFormDialog;