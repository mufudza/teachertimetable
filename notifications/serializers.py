from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notification model"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Notification
        fields = ('id', 'user', 'lesson', 'lesson_title', 'message', 
                  'time', 'read', 'type')
        read_only_fields = ('id', 'user', 'lesson', 'lesson_title', 
                           'message', 'time', 'type')