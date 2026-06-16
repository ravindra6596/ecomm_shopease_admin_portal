'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';
import { loginUser, saveAuthSession } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean().optional()
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ email: values.email, password: values.password });
      const token = response.access_token || (response as any).accessToken || (response as any).token || (response as any).jwt;
      if (!token) {
        throw new Error('Missing auth token');
      }
      saveAuthSession(token, (response as any).user);
      window.location.href = ROUTES.dashboard;
    } catch (err) {
      console.error('Login failed', err);
      setError('Unable to login. Please check your credentials and backend status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.15),_transparent_40%),_radial-gradient(ellipse_at_bottom_right,_rgba(99,102,241,0.1),_transparent_30%),_radial-gradient(ellipse_at_bottom_left,_rgba(168,85,247,0.08),_transparent_35%),#020617] px-4 py-10 sm:px-6">
      <Card className="w-full max-w-xl p-10 border border-white/10 bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-2xl">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-400 font-semibold">Welcome back</p>
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Sign in to your account</h1>
            <p className="text-sm text-slate-400">Enter your credentials to access the admin dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <Input type="email" placeholder="admin@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" {...register('password')} />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300 transition-colors">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-950" {...register('remember')} />
                Remember me
              </label>
              <Link href="#" className="text-sky-400 hover:text-sky-300 transition-colors">Forgot password?</Link>
            </div>

            <div className="space-y-3">
              {error && <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-rose-200 backdrop-blur-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Signing in...' : 'Sign in'}</Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-400">
            New here? <Link href={ROUTES.register} className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">Create an account</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
