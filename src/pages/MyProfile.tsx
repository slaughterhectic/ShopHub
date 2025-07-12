import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import Avatar from '../components/Profile/Avatar';
import toast from 'react-hot-toast';
import { Mail, User as UserIcon, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const profileFormSchema = z.object({
  full_name: z.string().min(3, { message: 'Full name must be at least 3 characters long.' }).max(50),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const MyProfile = () => {
  const { user, loading, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !isDirty) return;

    const toastId = toast.loading('Updating profile...');
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(updatedUser as User);
      toast.success('Profile updated successfully!', { id: toastId });
      reset({}, { keepValues: true });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.', { id: toastId });
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-lg text-gray-600 mt-1">Manage your personal information and account settings.</p>
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-1 bg-gray-50 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center text-center">
              <Avatar />
              <h2 className="mt-4 text-2xl font-bold text-gray-800 break-words">{user.full_name}</h2>
              <p className="text-gray-500 break-all">{user.email}</p>
              <div className="mt-6 text-sm text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="md:col-span-2 p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Full Name"
                  id="full_name"
                  type="text"
                  {...register('full_name')}
                  error={errors.full_name?.message}
                  icon={<UserIcon className="w-5 h-5 text-gray-400" />}
                />
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  icon={<Mail className="w-5 h-5 text-gray-400" />}
                  disabled
                  className="bg-gray-100"
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" loading={isSubmitting} disabled={!isDirty || isSubmitting}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
