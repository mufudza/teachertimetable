from django.db import models
from django.conf import settings


class Notification(models.Model):
    """Model for user notifications"""
    NOTIFICATION_TYPES = (
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('urgent', 'Urgent'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    lesson = models.ForeignKey(
        'timetable_app.Lesson', 
        on_delete=models.CASCADE, 
        related_name='notifications',
        null=True,
        blank=True
    )
    message = models.CharField(max_length=255)
    time = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    email_sent = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-time']
        indexes = [
            models.Index(fields=['user', '-time']),
            models.Index(fields=['user', 'read']),
            models.Index(fields=['email_sent']),
        ]
    
    def __str__(self):
        return self.message