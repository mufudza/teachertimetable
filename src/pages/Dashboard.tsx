import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLessons } from '@/api/lessons';
import { getNotifications } from '@/api/notifications';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: getLessons,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  if (lessonsLoading || notificationsLoading) return <LoadingSpinner />;

  const today = new Date();
  const dayIndex = today.getDay() - 1; // Adjust if lessons data starts on Monday (0)
  const todaysLessons = lessons?.filter(lesson => lesson.day === dayIndex)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">
            Today's Schedule - {format(today, 'EEEE, MMMM d')}
          </h2>
          {todaysLessons && todaysLessons.length > 0 ? (
            <div className="space-y-3">
              {todaysLessons.map(lesson => (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-lg bg-${lesson.color}-50 border border-${lesson.color}-200`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                      <p className="text-sm text-gray-600">{lesson.location}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {lesson.start_time.slice(0, 5)} - {lesson.end_time.slice(0, 5)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No lessons scheduled for today</p>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Notifications
          </h2>
          {notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg ${
                    notification.type === 'urgent'
                      ? 'bg-red-50 border-red-200'
                      : notification.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  } border`}
                >
                  <p className="text-gray-900">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(notification.time), 'PPp')}
                  </p>
                  {notification.lesson_title && (
                    <p className="text-sm text-gray-600 mt-1">
                      Lesson: {notification.lesson_title}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
