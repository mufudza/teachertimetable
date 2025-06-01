from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'username', 'is_staff', 'is_active', 'school', 'department')
    list_filter = ('is_staff', 'is_active', 'school', 'department')
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'profile_picture', 'bio')}),
        ('Professional info', {'fields': ('school', 'department', 'phone_number')}),
        ('Settings', {'fields': ('notification_preferences', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'username', 'first_name', 'last_name', 'school', 'department')
    ordering = ('email',)


admin.site.register(User, CustomUserAdmin)