from django.db import models
from django.conf import settings

# Constants for days of the week
DAY_CHOICES = (
    (0, 'Monday'),
    (1, 'Tuesday'),
    (2, 'Wednesday'),
    (3, 'Thursday'),
    (4, 'Friday'),
    (5, 'Saturday'),
    (6, 'Sunday'),
)

# Color choices for lessons
COLOR_CHOICES = (
    ('indigo', 'Indigo'),
    ('blue', 'Blue'),
    ('green', 'Green'),
    ('red', 'Red'),
    ('purple', 'Purple'),
    ('pink', 'Pink'),
    ('yellow', 'Yellow'),
    ('orange', 'Orange'),
    ('teal', 'Teal'),
)


class Lesson(models.Model):
    """Model for teacher lessons"""
    title = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='lessons'
    )
    day = models.IntegerField(choices=DAY_CHOICES)  # 0-6 for days of week
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=100)
    notes = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='indigo')
    is_recurring = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['day', 'start_time']
        indexes = [
            models.Index(fields=['teacher', 'day']),
            models.Index(fields=['day', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.get_day_display()} at {self.start_time}"


class LessonAttachment(models.Model):
    """Model for lesson attachments"""
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name='attachments'
    )
    name = models.CharField(max_length=100)
    file = models.FileField(upload_to='lesson_attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class LessonException(models.Model):
    """Model for one-time exceptions to recurring lessons"""
    EXCEPTION_TYPES = (
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('modified', 'Modified'),
    )
    
    lesson = models.ForeignKey(
        Lesson, 
        on_delete=models.CASCADE, 
        related_name='exceptions'
    )
    date = models.DateField()
    exception_type = models.CharField(max_length=20, choices=EXCEPTION_TYPES)
    
    # Fields for rescheduled or modified lessons
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('lesson', 'date')
        indexes = [
            models.Index(fields=['lesson', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Exception for {self.lesson} on {self.date}"