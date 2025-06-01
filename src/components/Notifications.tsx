import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAsRead, markAllAsRead } from '@/api/notifications';
import { Notification } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface NotificationsProps {
  open: boolean;
  onClose: () => void;
}

export default function Notifications({ open, onClose }: NotificationsProps) {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: open,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      // Optionally show a toast or log error
      console.error('Failed to mark all as read', error);
    },
  });

  return (
    <div
      className={`fixed top-16 right-6 z-50 w-96 max-w-full bg-white rounded-xl shadow-2xl border border-indigo-200 transition-all duration-200 ${open ? 'block' : 'hidden'}`}
      style={{ minHeight: 200 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-lg font-bold text-indigo-900">Notifications</h2>
        <button
          className="text-gray-400 hover:text-indigo-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>
      <div className="px-4 py-2 flex justify-end">
        <button
          className="text-indigo-600 text-sm font-medium hover:underline disabled:opacity-50"
          onClick={() => {
            if (!markAllAsReadMutation.isPending && notifications?.some(n => !n.read)) {
              markAllAsReadMutation.mutate();
            }
          }}
          disabled={markAllAsReadMutation.isPending || isLoading || !notifications?.some(n => !n.read)}
        >
          Mark all as read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : notifications && notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`py-3 px-2 flex items-start gap-3 rounded-lg ${n.read ? 'bg-gray-50' : 'bg-indigo-50/40'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {n.type === 'urgent' ? (
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500" title="Urgent" />
                  ) : n.type === 'warning' ? (
                    <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" title="Warning" />
                  ) : (
                    <span className="inline-block w-3 h-3 rounded-full bg-indigo-400" title="Info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {n.message}
                    {n.lesson_title && (
                      <span className="ml-2 text-xs text-indigo-700 font-semibold">[{n.lesson_title}]</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.time).toLocaleString()}</div>
                </div>
                {!n.read && (
                  <button
                    className="ml-2 text-xs text-indigo-600 hover:underline font-medium"
                    onClick={() => markAsReadMutation.mutate(n.id)}
                    disabled={markAsReadMutation.isPending}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-400 py-8">No notifications</div>
        )}
      </div>
    </div>
  );
}
