from django.utils import timezone
from django.core.mail import send_mail
from timetable_app.models import Lesson
from notifications.models import Notification
from django.conf import settings

def send_lesson_reminders():
    now = timezone.now()
    for minutes in [30, 10]:
        target_time = now + timezone.timedelta(minutes=minutes)
        print(f"Checking reminders for {target_time} (day={target_time.weekday()}, hour={target_time.hour}, minute={target_time.minute})")
        lessons = Lesson.objects.filter(
            day=target_time.weekday(),
            start_time__hour=target_time.hour,
            start_time__minute=target_time.minute
        )
        print(f"Found lessons: {list(lessons)}")
        for lesson in lessons:
            user = getattr(lesson, 'user', None) or getattr(lesson, 'teacher', None)
            if not user:
                print(f"Lesson {lesson.id} has no user/teacher field!")
                continue
            # Avoid duplicate notifications for the same lesson/time
            if Notification.objects.filter(user=user, lesson_id=lesson.id, message__icontains=f"{minutes} minutes").exists():
                continue
            # Create notification
            Notification.objects.create(
                user=user,
                message=f"Your lesson '{lesson.title}' starts in {minutes} minutes.",
                type='urgent' if minutes == 10 else 'info',
                lesson_id=lesson.id,
                lesson_title=lesson.title,
            )
            # Send email
            send_mail(
                subject="Lesson Reminder",
                message=f"Reminder: Your lesson '{lesson.title}' starts in {minutes} minutes.",
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourapp.com'),
                recipient_list=[user.email],
            )
            print(f"Notification and email sent for lesson {lesson.title} to {user.email}")

