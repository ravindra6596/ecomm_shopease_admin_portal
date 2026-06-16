'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';
import { registerUser, saveAuthSession } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setError('');
    setLoading(true);

    try {
      const response = await registerUser(values);
      const token = response.access_token || (response as any).accessToken || (response as any).token || (response as any).jwt;
      if (!token) {
        throw new Error('Missing auth token');
      }
      saveAuthSession(token, (response as any).user);
      window.location.href = ROUTES.dashboard;
    } catch (err) {
      console.error('Registration failed', err);
      setError('Unable to register. Please verify your details and backend availability.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15),_transparent_40%),_radial-gradient(ellipse_at_bottom_right,_rgba(56,189,248,0.1),_transparent_30%),_radial-gradient(ellipse_at_bottom_left,_rgba(168,85,247,0.08),_transparent_35%),#020617] px-4 py-10 sm:px-6">
      <Card className="w-full max-w-xl p-10 border border-white/10 bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="text-sm uppercase tracking-[0.35em] text-indigo-400 font-semibold">Create account</p>
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Start managing your store</h1>
            <p className="text-sm text-slate-400">Join the admin workspace to handle products, orders, users and analytics.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Name</label>
              <Input type="text" placeholder="Your full name" {...register('name')} />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input type="email" placeholder="admin@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" {...register('password')} />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-3">
              {error && <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200 backdrop-blur-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Creating account...' : 'Create account'}</Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-400">
            Already have an account? <Link href={ROUTES.login} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
