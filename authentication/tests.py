from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthenticationTests(TestCase):
    """Test suite for authentication functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'school': 'Test School',
            'department': 'Test Department'
        }
        
    def test_user_registration(self):
        """Test user registration with valid data"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')
        
    def test_user_registration_password_mismatch(self):
        """Test user registration with mismatched passwords"""
        data = self.user_data.copy()
        data['password2'] = 'different_password'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_user_login(self):
        """Test user login with valid credentials"""
        # Create a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='StrongPass123!'
        )
        
        # Try to login
        response = self.client.post(
            self.login_url, 
            {'email': 'test@example.com', 'password': 'StrongPass123!'}, 
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user_id', response.data)
        self.assertIn('email', response.data)