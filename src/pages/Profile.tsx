import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getProfile, updateProfile, changePassword } from '@/api/auth';
import { User } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      changePassword(data.oldPassword, data.newPassword, data.confirmPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
      reset();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail ||
        (typeof error?.response?.data === 'object' && Object.values(error.response.data).flat().join(' ')) ||
        'Failed to change password';
      toast.error(message);
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, watch } =
    useForm<PasswordForm>();
  const newPassword = watch('newPassword');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleProfileUpdate = (data: Partial<User>) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordChange = (data: PasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white shadow rounded-lg">
        {/* Profile Information */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Personal Information
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                handleProfileUpdate(data as Partial<User>);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="first_name" className="label">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  defaultValue={profile?.first_name}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  defaultValue={profile?.last_name}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="school" className="label">
                  School
                </label>
                <input
                  type="text"
                  id="school"
                  name="school"
                  defaultValue={profile?.school}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="department" className="label">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  defaultValue={profile?.department}
                  className="input"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="mt-1">{profile?.school}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="mt-1">{profile?.department}</p>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Change Password
          </h2>
          <form
            onSubmit={handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            <div>
              <label htmlFor="oldPassword" className="label">
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                {...register('oldPassword', {
                  required: 'Current password is required',
                })}
                className="input"
              />
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                className="input"
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === newPassword || 'Passwords do not match',
                })}
                className="input"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn btn-primary"
            >
              {changePasswordMutation.isPending
                ? 'Changing Password...'
                : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}