from celery import shared_task
from django.utils import timezone
from datetime import timedelta, datetime
from django.core.mail import send_mail
from django.conf import settings
from .models import Lesson, LessonException
from notifications.models import Notification
from django.contrib.auth import get_user_model
from timetable_app.models import Lesson
import pytz


@shared_task
def check_upcoming_lessons(days_ahead=1):
    """
    Check for upcoming lessons and create notifications
    """
    today = timezone.now().date()
    target_date = today + timedelta(days=days_ahead)
    
    # Get the weekday (0-6, Monday is 0)
    target_weekday = target_date.weekday()
    
    # Find all lessons on that day
    lessons = Lesson.objects.filter(day=target_weekday, is_recurring=True)
    
    for lesson in lessons:
        # Check if there's an exception for this lesson on the target date
        exception = LessonException.objects.filter(
            lesson=lesson, 
            date=target_date
        ).first()
        
        if exception:
            if exception.exception_type == 'cancelled':
                # Skip cancelled lessons
                continue
        
        # Create a notification for the upcoming lesson
        Notification.objects.create(
            user=lesson.teacher,
            lesson=lesson,
            message=f"Reminder: You have '{lesson.title}' tomorrow at {lesson.start_time}.",
            type='info'
        )
    
    return f"Checked {lessons.count()} lessons for {target_date}"


@shared_task
def send_email_notifications():
    """
    Send email notifications for unread notifications
    """
    # Get unread notifications that haven't been emailed
    notifications = Notification.objects.filter(
        read=False,
        email_sent=False
    )
    
    # Group by user
    user_notifications = {}
    for notification in notifications:
        if notification.user.id not in user_notifications:
            user_notifications[notification.user.id] = []
        user_notifications[notification.user.id].append(notification)
    
    # Send emails to each user
    for user_id, user_notifications_list in user_notifications.items():
        user = user_notifications_list[0].user
        
        # Skip if the user has disabled email notifications
        if user.notification_preferences.get('disable_emails', False):
            continue
        
        # Prepare email content
        subject = f"Teacher Timetable - You have {len(user_notifications_list)} new notifications"
        message = "Here are your recent notifications:\n\n"
        
        for notification in user_notifications_list:
            message += f"- {notification.message}\n"
        
        message += "\nLog in to view more details."
        
        # Send the email
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        # Mark notifications as emailed
        for notification in user_notifications_list:
            notification.email_sent = True
            notification.save()
    
    return f"Sent emails for {len(notifications)} notifications"


@shared_task
def clean_old_notifications(days=30):
    """
    Clean up old read notifications to keep the database size manageable
    """
    threshold_date = timezone.now() - timedelta(days=days)
    
    # Delete old read notifications
    deleted_count, _ = Notification.objects.filter(
        read=True,
        time__lt=threshold_date
    ).delete()
    
    return f"Deleted {deleted_count} old notifications"


@shared_task
def schedule_lesson_notifications(lesson_id):
    """
    Schedule notifications and email for a lesson 30 and 10 minutes before start time.
    """
    try:
        lesson = Lesson.objects.get(id=lesson_id)
        user = lesson.teacher
        # Assume lesson.start_time is a time object, and lesson.day is 0=Monday, 6=Sunday
        # Find the next date for this lesson
        now = timezone.now()
        today = now.date()
        weekday = today.weekday()
        days_ahead = (lesson.day - weekday) % 7
        lesson_date = today + timedelta(days=days_ahead)
        lesson_datetime = datetime.combine(lesson_date, lesson.start_time)
        lesson_datetime = timezone.make_aware(lesson_datetime, timezone.get_current_timezone())

        # Schedule for 30 and 10 minutes before
        for minutes_before in [30, 10]:
            notify_time = lesson_datetime - timedelta(minutes=minutes_before)
            if notify_time > now:
                Notification.objects.create(
                    user=user,
                    lesson=lesson,
                    message=f"Reminder: '{lesson.title}' starts in {minutes_before} minutes at {lesson.start_time}.",
                    type='urgent' if minutes_before == 10 else 'info'
                )
                # Send email
                send_mail(
                    f"Lesson Reminder: {lesson.title}",
                    f"You have '{lesson.title}' at {lesson.start_time} in {minutes_before} minutes.",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
        return f"Notifications and emails scheduled for lesson {lesson_id}"
    except Lesson.DoesNotExist:
        return f"Lesson {lesson_id} does not exist."