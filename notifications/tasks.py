from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from timetable_app.models import Lesson
from notifications.models import Notification
from django.contrib.auth import get_user_model


@shared_task
def send_notification_summary():
    """
    Send a daily summary of notifications to users
    """
    yesterday = timezone.now() - timedelta(days=1)
    
    # Get all users with notifications from the last day
    User = get_user_model()
    
    users_with_notifications = User.objects.filter(
        notifications__time__gte=yesterday
    ).distinct()
    
    for user in users_with_notifications:
        # Skip if the user has disabled summary emails
        if user.notification_preferences.get('disable_summary_emails', False):
            continue
            
        # Get all notifications for this user from the last day
        notifications = Notification.objects.filter(
            user=user,
            time__gte=yesterday
        ).order_by('-time')
        
        if not notifications.exists():
            continue
            
        # Prepare email content
        subject = f"Teacher Timetable - Your Daily Summary"
        message = f"Hello {user.first_name or user.username},\n\n"
        message += f"Here is your daily summary of notifications from Teacher Timetable:\n\n"
        
        # Group by type
        info_notifications = notifications.filter(type='info')
        warning_notifications = notifications.filter(type='warning')
        urgent_notifications = notifications.filter(type='urgent')
        
        if urgent_notifications.exists():
            message += "URGENT NOTIFICATIONS:\n"
            for notif in urgent_notifications:
                message += f"- {notif.message}\n"
            message += "\n"
            
        if warning_notifications.exists():
            message += "WARNING NOTIFICATIONS:\n"
            for notif in warning_notifications:
                message += f"- {notif.message}\n"
            message += "\n"
            
        if info_notifications.exists():
            message += "INFORMATION NOTIFICATIONS:\n"
            for notif in info_notifications:
                message += f"- {notif.message}\n"
            message += "\n"
        
        message += "Log in to your account to view more details and manage your timetable.\n\n"
        message += "Best regards,\nTeacher Timetable Team"
        
        # Send the email
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    
    return f"Sent summary emails to {users_with_notifications.count()} users"

@shared_task
def send_lesson_reminders_task():
    send_lesson_reminders()

def send_lesson_reminders():
    from django.utils import timezone
    import pytz
    local_tz = pytz.timezone('Africa/Harare')
    now = timezone.now().astimezone(local_tz)
    print(f"[DEBUG] send_lesson_reminders running at {now}")
    from datetime import time
    for minutes in [30, 10]:
        target_time = now + timezone.timedelta(minutes=minutes)
        target_day = target_time.weekday()
        target_time_only = time(target_time.hour, target_time.minute)
        print(f"[DEBUG] Checking reminders for day={target_day}, time={target_time_only}")
        lessons = Lesson.objects.filter(
            day=target_day,
            start_time=target_time_only,
            is_recurring=True
        )
        print(f"[DEBUG] Found lessons: {list(lessons)}")
        for lesson in lessons:
            user = getattr(lesson, 'user', None) or getattr(lesson, 'teacher', None)
            print(f"[DEBUG] Processing lesson {lesson.id}, user: {user}")
            if not user:
                print(f"[DEBUG] Lesson {lesson.id} has no user/teacher field!")
                continue
            # Avoid duplicate notifications for the same lesson/time
            if Notification.objects.filter(user=user, lesson_id=lesson.id, message__icontains=f"{minutes} minutes").exists():
                print(f"[DEBUG] Duplicate notification for lesson {lesson.id}, user {user}")
                continue
            # Create notification
            Notification.objects.create(
                user=user,
                lesson=lesson,
                message=f"Your lesson '{lesson.title}', starts in {minutes} minutes.",
                type='urgent' if minutes == 10 else 'info',
            )
            print(f"[DEBUG] Notification created for lesson {lesson.title} to {user.email}")
            # Send email
            send_mail(
                subject="Lesson Reminder",
                message=f"Reminder: Your lesson '{lesson.title}' starts in {minutes} minutes.",
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourapp.com'),
                recipient_list=[user.email],
            )
            print(f"[DEBUG] Email sent for lesson {lesson.title} to {user.email}")