from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')  # No double path

urlpatterns = [
    path('', include(router.urls)),
]

