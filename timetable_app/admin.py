from django.contrib import admin
from .models import Lesson, LessonAttachment, LessonException


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'teacher', 'day', 'start_time', 'end_time', 'location')
    list_filter = ('day', 'teacher', 'subject')
    search_fields = ('title', 'subject', 'location', 'teacher__email', 'teacher__username')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('title', 'subject', 'teacher')
        }),
        ('Schedule', {
            'fields': ('day', 'start_time', 'end_time', 'location')
        }),
        ('Additional Info', {
            'fields': ('notes', 'color', 'is_recurring')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LessonAttachment)
class LessonAttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'lesson', 'uploaded_at')
    list_filter = ('uploaded_at', 'lesson__teacher')
    search_fields = ('name', 'lesson__title')
    date_hierarchy = 'uploaded_at'
    readonly_fields = ('uploaded_at',)


@admin.register(LessonException)
class LessonExceptionAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'date', 'exception_type')
    list_filter = ('exception_type', 'date', 'lesson__teacher')
    search_fields = ('lesson__title', 'lesson__teacher__email')
    date_hierarchy = 'date'
    fieldsets = (
        (None, {
            'fields': ('lesson', 'date', 'exception_type')
        }),
        ('Modified Schedule', {
            'fields': ('start_time', 'end_time', 'location', 'notes'),
            'classes': ('collapse',)
        }),
    )