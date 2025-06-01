import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'timetable_project.settings')

app = Celery('timetable_project')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()


# Celery Beat schedule for lesson reminders
app.conf.beat_schedule = {
    'send-lesson-reminders-every-minute': {
        'task': 'notifications.tasks.send_lesson_reminders_task',
        'schedule': 60.0,  # every minute
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')