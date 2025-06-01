from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LessonViewSet,
    LessonAttachmentViewSet,
    LessonExceptionViewSet
)

router = DefaultRouter()
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'attachments', LessonAttachmentViewSet, basename='attachment')
router.register(r'exceptions', LessonExceptionViewSet, basename='exception')

urlpatterns = [
    path('', include(router.urls)),
]