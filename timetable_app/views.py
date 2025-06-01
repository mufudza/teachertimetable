from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Lesson, LessonAttachment, LessonException
from .serializers import (
    LessonSerializer, 
    LessonDetailSerializer,
    LessonAttachmentSerializer,
    LessonExceptionSerializer
)
from timetable_app.tasks import schedule_lesson_notifications


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write permissions are only allowed to the owner
        return obj.teacher == request.user


class LessonViewSet(viewsets.ModelViewSet):
    """ViewSet for Lesson model"""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """
        Return lessons for the currently authenticated user,
        with optional filtering by day
        """
        user = self.request.user
        queryset = Lesson.objects.filter(teacher=user)
        
        # Filter by day if provided as query param
        day = self.request.query_params.get('day')
        if day is not None:
            queryset = queryset.filter(day=day)
        
        # Search by title, subject, or location
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(subject__icontains=search) |
                Q(location__icontains=search)
            )
            
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return LessonDetailSerializer
        return LessonSerializer
    
    @action(detail=False, methods=['get'], url_path=r'day/(?P<day>\d+)')
    def by_day(self, request, day=None):
        """Custom action to get lessons by day via URL path"""
        lessons = self.get_queryset().filter(day=day)
        serializer = self.get_serializer(lessons, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='add-attachment')
    def add_attachment(self, request, pk=None):
        """Add an attachment to a lesson"""
        lesson = self.get_object()
        serializer = LessonAttachmentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(lesson=lesson)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='add-exception')
    def add_exception(self, request, pk=None):
        """Add an exception to a lesson"""
        lesson = self.get_object()
        serializer = LessonExceptionSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(lesson=lesson)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='schedule_notifications')
    def schedule_notifications(self, request, pk=None):
        """Schedule notifications and emails for this lesson"""
        lesson = self.get_object()
        schedule_lesson_notifications.delay(lesson.id)
        return Response({'status': 'Notifications scheduled'}, status=status.HTTP_200_OK)


class LessonAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for LessonAttachment model"""
    serializer_class = LessonAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return attachments for the currently authenticated user's lessons"""
        user = self.request.user
        return LessonAttachment.objects.filter(lesson__teacher=user)
    
    def perform_destroy(self, instance):
        """Ensure the user owns the lesson before deleting"""
        if instance.lesson.teacher != self.request.user:
            raise permissions.PermissionDenied("You do not have permission to delete this attachment.")
        instance.delete()


class LessonExceptionViewSet(viewsets.ModelViewSet):
    """ViewSet for LessonException model"""
    serializer_class = LessonExceptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return exceptions for the currently authenticated user's lessons"""
        user = self.request.user
        return LessonException.objects.filter(lesson__teacher=user)
    
    def perform_destroy(self, instance):
        """Ensure the user owns the lesson before deleting"""
        if instance.lesson.teacher != self.request.user:
            raise permissions.PermissionDenied("You do not have permission to delete this exception.")
        instance.delete()
