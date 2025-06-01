# Teacher Timetable App - Django Backend & React Frontend

This repository contains the full-stack Teacher Timetable application. The backend is a Django REST API with Celery for background tasks, and the frontend is a React/TypeScript app styled with Tailwind CSS.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Features

- User authentication with JWT tokens
- CRUD operations for teacher lessons/timetables
- Notification system for upcoming lessons
- Email and in-app notifications (reminders, summaries)
- Background task processing with Celery and Redis
- RESTful API endpoints with clear documentation (Swagger)
- Responsive, modern UI (React + Tailwind CSS)
- Real-time updates (React Query)
- Admin dashboard (Django admin)

## Backend Setup Instructions

1. **Clone the repository:**

   ```pwsh
   git clone <https://github.com/mufudza/teachertimetable.git>
   cd teacherTimetable
   ```

2. **Create a virtual environment and activate it:**

   ```pwsh
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```pwsh
   pip install -r requirements.txt
   ```

4. **Configure environment variables and settings:**

   - Open `timetable_project/settings.py` and set:
     - `TIME_ZONE` to your local timezone (e.g. 'Africa/Harare')
     - Email backend settings (see below)
   - For email notifications, use the provided no-reply Gmail (with app password). Example (matches `settings.py`):

     ```python
     EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
     EMAIL_HOST = 'smtp.gmail.com'
     EMAIL_PORT = 587
     EMAIL_USE_TLS = True
     EMAIL_HOST_USER = 'noreply.teachertimetable82@gmail.com'
     EMAIL_HOST_PASSWORD = '<your-app-password>'
     DEFAULT_FROM_EMAIL = 'noreply.teachertimetable82@gmail.com'
   - For production, set `DEBUG = False` and configure `ALLOWED_HOSTS`.

5. **Run migrations:**

   ```pwsh
   python manage.py migrate
   ```

6. **Create a superuser:**

   ```pwsh
   python manage.py createsuperuser
   ```

7. **Start Redis (required for Celery):**

   - Download and extract Redis for Windows if not already present (see `Redis-x64-5.0.14.1/`).
   - Start Redis server:

     ```pwsh
     .\Redis-x64-5.0.14.1\redis-server.exe
     ```

8. **Run the development server:**

   ```pwsh
   python manage.py runserver
   ```

9. **Start Celery worker and beat (in separate terminals):**

   ```pwsh
   celery -A timetable_project worker --loglevel=info -P solo
   celery -A timetable_project beat --loglevel=info
   ```

   - The `-P solo` flag is required on Windows.
   - Make sure both are running for notifications and emails to work.

10. **Access the app:**

    - API: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
    - Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
    - API docs: [http://127.0.0.1:8000/api/swagger/](http://127.0.0.1:8000/api/swagger/)

### Key Backend Files & Folders

- `authentication/` — User model, authentication endpoints
- `notifications/` — Notification model, Celery tasks, periodic reminders
- `timetable_app/` — Lesson, LessonException models, lesson logic
- `timetable_project/` — Django project config, Celery config, settings
- `manage.py` — Django entrypoint
- `requirements.txt` — Python dependencies
- `Redis-x64-5.0.14.1/` — Redis server for Celery

## Frontend (React + TypeScript + Tailwind CSS)

### Setup

1. **Install dependencies:**

   ```pwsh
rm -r node_modules
del package-lock.json
npm install
npm run dev
  
   npm install
   ```

2. **Start the frontend dev server:**

   ```pwsh
   npm run dev
   ```
- if you encounter errors
  
 ```pwsh
rm -r node_modules
del package-lock.json
npm install
npm run dev

3. **Configure API URL:**
   - If needed, set the backend API URL in your frontend `.env` or config files (e.g., `VITE_API_URL=http://localhost:8000/api/`).

### Project Structure

- `teachertimetable/` — React app root
- `src/pages/Timetable.tsx` — Main timetable UI
- `src/components/Notifications.tsx` — Notification UI
- `src/api/lessons.ts` — API calls for lessons
- `src/api/notifications.ts` — API calls for notifications
- `src/contexts/AuthContext.tsx` — Authentication context
- `src/styles/` — Tailwind and global styles

### Development Tips

- Uses React Query for data fetching and caching.
- Tailwind CSS for styling.
- JWT authentication for secure API access.
- All lesson and notification data is fetched from the Django backend.

### Testing

```pwsh
npm run test
```

### Troubleshooting

- **API errors or CORS issues?**
  - Make sure the backend is running and CORS is enabled for your frontend URL in Django settings.
- **Authentication issues?**
  - Ensure your JWT token is stored and sent with requests (see `AuthContext.tsx`).
- **Frontend not updating?**
  - Use React Query's `invalidateQueries` to refresh data after changes.
- **Styling issues?**
  - Make sure Tailwind CSS is installed and configured in `postcss.config.js` and `tailwind.config.js`.

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT token
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - Logout (invalidate token)
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

### Lessons

- `GET /api/lessons/` - List all lessons for the current user
- `POST /api/lessons/` - Create a new lesson
- `GET /api/lessons/{id}/` - Get a specific lesson
- `PUT /api/lessons/{id}/` - Update a lesson
- `DELETE /api/lessons/{id}/` - Delete a lesson
- `POST /api/lessons/{id}/add-attachment/` - Add attachment to a lesson
- `POST /api/lessons/{id}/add-exception/` - Add exception to a lesson

### Notifications

- `GET /api/notifications/` - List all notifications for the current user
- `PATCH /api/notifications/{id}/mark_read/` - Mark a notification as read
- `POST /api/notifications/mark-all-read/` - Mark all notifications as read
- `GET /api/notifications/unread_count/` - Get count of unread notifications

## Background Tasks

The application uses Celery to handle these background tasks:

1. Check for upcoming lessons and create notifications
2. Send email notifications for upcoming lessons
3. Clean up old notifications
4. Send daily notification summaries

## Running Tests

To run the test suite:

```pwsh
python manage.py test
```

## API Documentation

API documentation is available at `/api/swagger/` when the server is running.

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in settings.py
2. Use a production-ready database (PostgreSQL recommended)
3. Configure proper email backend (Mailgun or a dedicated SMTP recommended for reliability)
4. Set up proper static file serving (collectstatic, serve with Nginx/Apache)
5. Use HTTPS
6. Configure proper CORS settings
7. Set up Celery with a production broker (Redis/RabbitMQ)
8. Set a secure `SECRET_KEY` and do not expose it publicly
9. Monitor logs and background tasks for errors

## Common Issues & Solutions

- **Emails not sending?**
  - Double-check your email backend and credentials in `settings.py`.
  - For Gmail, you must use an app password (not your main password) and may need to enable access for less secure apps.
- **Celery tasks not running?**
  - Make sure both the worker and beat are running and connected to Redis.
  - On Windows, always use `-P solo` for the worker.
- **Timezone issues?**
  - Ensure `TIME_ZONE` is set correctly and all times are stored/compared as timezone-aware datetimes.
- **Database errors?**
  - Run `python manage.py migrate` and ensure your database is accessible.

---

## MIT License

Copyright (c) 2025 PETER MUFUDZA
