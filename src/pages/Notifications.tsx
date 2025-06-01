import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notifications';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      toast.success('All notifications marked as read');
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={() => markAllAsReadMutation.mutate()}
          className="btn btn-secondary"
          disabled={markAllAsReadMutation.isPending}
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications</p>
        ) : (
          notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read ? 'bg-white' : 'bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
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
                {!notification.read && (
                  <button
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={markAsReadMutation.isPending}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}