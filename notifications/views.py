from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)

        read = self.request.query_params.get('read')
        if read is not None:
            queryset = queryset.filter(read=read.lower() == 'true')

        notif_type = self.request.query_params.get('type')
        if notif_type:
            queryset = queryset.filter(type=notif_type)

        return queryset

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        count = Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'notifications marked as read', 'count': count})

    @action(detail=False, methods=['get'], url_path='unread_count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, read=False).count()
        return Response({'unread_count': count})
