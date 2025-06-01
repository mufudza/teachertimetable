from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Lesson, LessonException, LessonAttachment
from datetime import time

User = get_user_model()


class LessonTests(TestCase):
    """Test suite for lesson functionality"""
    
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
            location='Room 101',
            notes='Introduction to Algebra',
            color='blue'
        )
        
    def test_create_lesson(self):
        """Test creating a new lesson"""
        url = reverse('lesson-list')
        data = {
            'title': 'Physics Class',
            'subject': 'Physics',
            'day': 1,  # Tuesday
            'start_time': '11:00:00',
            'end_time': '12:00:00',
            'location': 'Lab 202',
            'notes': 'Mechanics',
            'color': 'green',
            'is_recurring': True
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lesson.objects.count(), 2)
        self.assertEqual(response.data['title'], 'Physics Class')
        
    def test_list_lessons(self):
        """Test listing all lessons for the authenticated user"""
        url = reverse('lesson-list')
        response = self.client.get(url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Math Class')
        
    def test_filter_lessons_by_day(self):
        """Test filtering lessons by day"""
        # Create another lesson on a different day
        Lesson.objects.create(
            title='History Class',
            subject='History',
            teacher=self.user,
            day=2,  # Wednesday
            start_time=time(13, 0),
            end_time=time(14, 0),
            location='Room 305',
            color='red'
        )
        
        # Filter by Monday (day=0)
        url = reverse('lesson-list')
        response = self.client.get(f'{url}?day=0', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Math Class')
        
    def test_update_lesson(self):
        """Test updating a lesson"""
        url = reverse('lesson-detail', args=[self.lesson.id])
        data = {
            'title': 'Advanced Math',
            'subject': 'Mathematics',
            'day': 0,
            'start_time': '09:30:00',
            'end_time': '10:30:00',
            'location': 'Room 101',
            'notes': 'Advanced Algebra Topics',
            'color': 'purple'
        }
        
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.lesson.refresh_from_db()
        self.assertEqual(self.lesson.title, 'Advanced Math')
        self.assertEqual(self.lesson.start_time, time(9, 30))
        
    def test_delete_lesson(self):
        """Test deleting a lesson"""
        url = reverse('lesson-detail', args=[self.lesson.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Lesson.objects.count(), 0)
        
    def test_add_exception(self):
        """Test adding an exception to a lesson"""
        url = reverse('lesson-add-exception', args=[self.lesson.id])
        data = {
            'date': '2023-04-10',  # A Monday
            'exception_type': 'cancelled'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LessonException.objects.count(), 1)
        self.assertEqual(LessonException.objects.first().exception_type, 'cancelled')