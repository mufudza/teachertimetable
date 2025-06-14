# Generated by Django 5.2.1 on 2025-05-26 10:57

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('timetable_app', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=255)),
                ('time', models.DateTimeField(auto_now_add=True)),
                ('read', models.BooleanField(default=False)),
                ('type', models.CharField(choices=[('info', 'Information'), ('warning', 'Warning'), ('urgent', 'Urgent')], default='info', max_length=10)),
                ('email_sent', models.BooleanField(default=False)),
                ('lesson', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='timetable_app.lesson')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-time'],
                'indexes': [models.Index(fields=['user', '-time'], name='notificatio_user_id_76dfaf_idx'), models.Index(fields=['user', 'read'], name='notificatio_user_id_878a13_idx'), models.Index(fields=['email_sent'], name='notificatio_email_s_9fe133_idx')],
            },
        ),
    ]
