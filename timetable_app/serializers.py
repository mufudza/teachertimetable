from rest_framework import serializers
from .models import Lesson, LessonAttachment, LessonException


class LessonAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for lesson attachments"""
    class Meta:
        model = LessonAttachment
        fields = ('id', 'name', 'file', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at')


class LessonExceptionSerializer(serializers.ModelSerializer):
    """Serializer for lesson exceptions"""
    class Meta:
        model = LessonException
        fields = ('id', 'date', 'exception_type', 'start_time', 'end_time', 'location', 'notes')
        read_only_fields = ('id',)


class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lessons"""
    attachments = LessonAttachmentSerializer(many=True, read_only=True)
    exceptions = LessonExceptionSerializer(many=True, read_only=True)
    day_display = serializers.CharField(source='get_day_display', read_only=True)
    color_display = serializers.CharField(source='get_color_display', read_only=True)
    
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'subject', 'teacher', 'day', 'day_display', 
                  'start_time', 'end_time', 'location', 'notes', 'color', 
                  'color_display', 'is_recurring', 'created_at', 'updated_at',
                  'attachments', 'exceptions')
        read_only_fields = ('id', 'created_at', 'updated_at', 'teacher')
    
    def create(self, validated_data):
        # Set the teacher to the current user
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, data):
        """Validate start time is before end time"""
        if data.get('start_time') and data.get('end_time'):
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time.'
                })
        return data


class LessonDetailSerializer(LessonSerializer):
    """Detailed serializer for single lesson view"""
    
    class Meta(LessonSerializer.Meta):
        pass