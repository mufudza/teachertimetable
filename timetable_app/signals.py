from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Lesson, LessonException
from notifications.models import Notification


@receiver(post_save, sender=Lesson)
def create_lesson_notification(sender, instance, created, **kwargs):
    """Create a notification when a new lesson is created"""
    if created:
        Notification.objects.create(
            user=instance.teacher,
            lesson=instance,
            message=f"New lesson '{instance.title}' has been created.",
            type='info'
        )


@receiver(post_save, sender=LessonException)
def create_exception_notification(sender, instance, created, **kwargs):
    """Create a notification when a lesson exception is created"""
    if created:
        if instance.exception_type == 'cancelled':
            message = f"Lesson '{instance.lesson.title}' on {instance.date} has been cancelled."
            notification_type = 'warning'
        elif instance.exception_type == 'rescheduled':
            message = f"Lesson '{instance.lesson.title}' on {instance.date} has been rescheduled."
            notification_type = 'info'
        else:
            message = f"Lesson '{instance.lesson.title}' on {instance.date} has been modified."
            notification_type = 'info'
            
        Notification.objects.create(
            user=instance.lesson.teacher,
            lesson=instance.lesson,
            message=message,
            type=notification_type
        )


@receiver(post_delete, sender=Lesson)
def create_lesson_deleted_notification(sender, instance, **kwargs):
    """Create a notification when a lesson is deleted"""
    Notification.objects.create(
        user=instance.teacher,
        message=f"Lesson '{instance.title}' has been deleted.",
        type='warning'
    )