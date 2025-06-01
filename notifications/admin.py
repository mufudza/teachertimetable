from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'time', 'read', 'type')
    list_filter = ('read', 'type', 'time')
    search_fields = ('user__username', 'user__email', 'message')
    date_hierarchy = 'time'
    readonly_fields = ('time',)
    fieldsets = (
        (None, {
            'fields': ('user', 'lesson', 'message', 'type')
        }),
        ('Status', {
            'fields': ('read', 'email_sent', 'time')
        }),
    )