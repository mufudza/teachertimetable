from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Notification
from timetable_app.models import Lesson
from datetime import time

User = get_user_model()


class NotificationTests(TestCase):
    """Test suite for notification functionality"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create a test user
        self.user = User.objects.create_user(
            username='teacher1',
            email='teacher@example.com',
            password='StrongPass123!'
        )
        
        # Authenticate the client
        self.client.force_authenticate(user=self.user)
        
        # Create a test lesson
        self.lesson = Lesson.objects.create(
            title='Math Class',
            subject='Mathematics',
            teacher=self.user,
            day=0,  # Monday
            start_time=time(9, 0),  # 9:00 AM
            end_time=time(10, 0),  # 10:00 AM
            location='Room 101'
        )
        
        # Create test notifications
        self.notification1 = Notification.objects.create(
            user=self.user,
            lesson=self.lesson,
            message="New lesson 'Math Class' has been created.",
            type='info'
        )
        
        self.notification2 = Notification.objects.create(
            user=self.user,
            message="Your profile has been updated.",
            type='info'
        )
        
    def test_list_notifications(self):
        """Test listing all notifications for the authenticated user"""
        url = reverse('notification-list')
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
    def test_mark_notification_as_read(self):
        """Test marking a notification as read"""
        url = reverse('notification-mark-read', args=[self.notification1.id])
        response = self.client.patch(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.notification1.refresh_from_db()
        self.assertTrue(self.notification1.read)
        
    def test_mark_all_notifications_as_read(self):
        """Test marking all notifications as read"""
        url = reverse('notification-mark-all-read')
        response = self.client.post(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        
        # Check that all notifications are marked as read
        notifications = Notification.objects.filter(user=self.user)
        for notification in notifications:
            self.assertTrue(notification.read)
            
    def test_filter_unread_notifications(self):
        """Test filtering unread notifications"""
        # Mark one notification as read
        self.notification1.read = True
        self.notification1.save()
        
        url = reverse('notification-list')
        response = self.client.get(f'{url}?read=false', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.notification2.id)
        
    def test_get_unread_count(self):
        """Test getting the count of unread notifications"""
        # Mark one notification as read
        self.notification1.read = True
        self.notification1.save()
        
        url = reverse('notification-unread-count')
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['unread_count'], 1)