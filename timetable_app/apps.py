from django.apps import AppConfig


class TimetableAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'timetable_app'
    
    def ready(self):
        import timetable_app.signals  # noqa