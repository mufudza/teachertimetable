import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLessons, createLesson, updateLesson, deleteLesson } from '../api/lessons';
import LoadingSpinner from '../components/LoadingSpinner';
import LessonFormDialog from '../components/LessonFormDialog';

import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Lesson } from '../types';
import { PlusCircle } from 'lucide-react';


const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// Generate time slots with 30-minute intervals for more precision
const TIME_SLOTS: string[] = [];
for (let hour = 5; hour < 19; hour++) {
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
}

const COLORS = ['indigo', 'blue', 'green', 'red', 'purple', 'pink', 'yellow', 'orange', 'teal'];

const colorMap: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  orange: 'bg-orange-100 text-orange-800',
  teal: 'bg-teal-100 text-teal-800',
};

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

// Convert time string (HH:MM) to slot index
const timeToSlotIndex = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  // Each hour has 2 slots (00 and 30), and we start at 5:00
  const hourOffset = (hours - 5) * 2;
  const minuteOffset = minutes >= 30 ? 1 : 0;
  return hourOffset + minuteOffset;
};

// Calculate number of slots a lesson spans
const calculateSlotSpan = (startTime: string, endTime: string): number => {
  const startIndex = timeToSlotIndex(startTime);
  const endIndex = timeToSlotIndex(endTime);
  return endIndex - startIndex;
};

const Timetable: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<LessonForm>();

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  const createLessonMutation = useMutation({
    mutationFn: (data: LessonForm) => createLesson({
      ...data,
      day: parseInt(data.day as string, 10),
      is_recurring: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setIsModalOpen(false);
      reset();
      setSelectedLesson(null);
      toast.success('Lesson created successfully');
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (data: LessonForm) => updateLesson(data.id!, {
      ...data,
      day: parseInt(data.day as string, 10),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setIsModalOpen(false);
      reset();
      setSelectedLesson(null);
      toast.success('Lesson updated successfully');
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (id: number) => deleteLesson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setIsModalOpen(false);
      reset();
      setSelectedLesson(null);
      toast.success('Lesson deleted successfully');
    },
  });

  const onSubmit = (data: LessonForm) => {
    if (selectedLesson) {
      updateLessonMutation.mutate({ ...data, id: selectedLesson.id });
    } else {
      createLessonMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (selectedLesson) {
      setValue('title', selectedLesson.title);
      setValue('subject', selectedLesson.subject);
      setValue('day', selectedLesson.day.toString());
      setValue('start_time', selectedLesson.start_time.slice(0, 5));
      setValue('end_time', selectedLesson.end_time.slice(0, 5));
      setValue('location', selectedLesson.location);
      setValue('color', selectedLesson.color);
      setValue('notes', selectedLesson.notes || '');
    } else {
      reset();
      setValue('day', '0');
      setValue('color', COLORS[0]);
    }
  }, [selectedLesson, setValue, reset]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const onLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsModalOpen(true);
  };

  // Generate the timetable grid with lessons
  const renderTimetable = () => {
    return DAYS.map((day, dayIndex) => {
      const lessonsForDay = lessons?.filter(lesson => lesson.day === dayIndex) || [];

      return (
        <tr key={day} className="hover:bg-indigo-50/60 transition-colors">
          <td className="border border-gray-300 bg-white sticky left-0 z-10 px-4 py-2 font-semibold text-indigo-900 whitespace-nowrap rounded-l-2xl shadow-sm">
            {day}
          </td>

          {TIME_SLOTS.map((_: string, slotIndex: number) => {
            // Find a lesson that starts at this exact time slot
            const lessonAtTime: Lesson | undefined = lessonsForDay.find((lesson: Lesson) => {
              const startSlot: number = timeToSlotIndex(lesson.start_time);
              return slotIndex === startSlot;
            });

            if (lessonAtTime) {
              const span: number = calculateSlotSpan(lessonAtTime.start_time, lessonAtTime.end_time);
              return (
          <td
            key={slotIndex}
            className="border border-gray-300 p-1"
            colSpan={span}
          >
            <div
              className={`h-full p-2 rounded-lg cursor-pointer select-none text-xs font-medium shadow-md ring-1 ring-indigo-200 hover:ring-2 hover:ring-indigo-400 transition-all duration-100 ${
                colorMap[lessonAtTime.color] || 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => onLessonClick(lessonAtTime)}
              title={`${lessonAtTime.title} - ${lessonAtTime.subject}`}
            >
              <div className="flex justify-between items-start">
                <p className="font-bold truncate">{lessonAtTime.title}</p>
                <span className="text-xs px-1.5 py-0.5 bg-white/50 rounded-md">
            {lessonAtTime.start_time.slice(0, 5)}-{lessonAtTime.end_time.slice(0, 5)}
                </span>
              </div>
              <p className="text-xs mt-1 font-medium">{lessonAtTime.subject}</p>
              <p className="text-xs mt-0.5 opacity-80">{lessonAtTime.location}</p>
            </div>
          </td>
              );
            }

            // Check if this slot is part of a spanning lesson
            const isPartOfSpanningLesson: boolean = lessonsForDay.some((lesson: Lesson) => {
              const startSlot: number = timeToSlotIndex(lesson.start_time);
              const endSlot: number = timeToSlotIndex(lesson.end_time);
              return slotIndex > startSlot && slotIndex < endSlot;
            });

            if (!isPartOfSpanningLesson) {
              return (
          <td
            key={slotIndex}
            className="border border-gray-300 px-1 py-2 text-center align-top cursor-default min-w-[40px] min-h-[48px]"
          >
            <span className="text-gray-300 italic text-xs">—</span>
          </td>
              );
            }

            return null;
          })}
        </tr>
      );
    });
  };

return (
  <div>
    <div className="max-w-full mx-auto px-4 py-8 relative">
  <div className="mb-8 flex items-center justify-start relative">
    {/* Centered Timetable text */}
    <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-extrabold text-indigo-900 drop-shadow-sm tracking-tight">
      Timetable
    </h1>

    {/* Add Lesson Button on the left */}
    <button
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:scale-105 transition-transform duration-150 flex items-center gap-2"
      onClick={() => {
        setSelectedLesson(null);
        setIsModalOpen(true);
      }}
    >
      <PlusCircle className="w-5 h-5" />
      Add Lesson
    </button>
  </div>
</div>


    <div className="overflow-auto border rounded-2xl shadow-xl bg-white/80 backdrop-blur-md">
      <table className="min-w-max border-collapse border border-gray-300 table-fixed">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-indigo-100 sticky left-0 z-20 px-4 py-3 text-left w-32 rounded-tl-2xl"></th>
            {TIME_SLOTS.map((time, index) => (
              <th
                key={time}
                className={`border border-gray-300 px-2 py-2 text-center text-xs font-bold text-indigo-800 w-12 sticky top-0 z-10 ${
                  index % 2 === 0 ? 'bg-indigo-100' : 'bg-indigo-50'
                }`}
              >
                {time}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {renderTimetable()}
        </tbody>
      </table>
    </div>

    <LessonFormDialog 
      isOpen={isModalOpen} 
      onClose={() => {
        setIsModalOpen(false);
        setSelectedLesson(null);
        reset();
      }}
      selectedLesson={selectedLesson}
      onSubmit={onSubmit}
      register={register}
      handleSubmit={handleSubmit}
      errors={errors}
      isCreating={createLessonMutation.isPending}
      isUpdating={updateLessonMutation.isPending}
      isDeleting={deleteLessonMutation.isPending}
      onDelete={(id) => deleteLessonMutation.mutate(id)}
      createError={createLessonMutation.error}
      updateError={updateLessonMutation.error}
      deleteError={deleteLessonMutation.error}
    />
  </div>
);
};

export default Timetable;