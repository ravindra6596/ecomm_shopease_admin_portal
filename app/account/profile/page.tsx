'use client';

import { useEffect, useState } from 'react';
import { Loader2, User, Mail, CheckCircle, XCircle } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants/routes';
import { getCurrentUserProfile } from '@/services/users';
import type { UserProfile } from '@/types';

export default function AccountProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const profile = await getCurrentUserProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to load profile', err);
        const message = err instanceof Error ? err.message : 'Unable to load profile';
        setError(`Unable to load profile. ${message}`);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
              <User className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400 font-semibold">Account Profile</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">My Profile</h1>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Profile Details</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4 h-14">
                <div className="h-8 w-8 rounded-full bg-slate-900/50 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-medium">Loading...</p>
                  <p className="text-sm text-slate-400">Fetching your profile information</p>
                </div>
              </div>
              {/* Skeleton placeholders */}
              <div className="space-y-3">
                <div className="h-4 w-32 bg-slate-900/50 rounded" />
                <div className="h-4 w-24 bg-slate-900/50 rounded" />
                <div className="h-4 w-24 bg-slate-900/50 rounded" />
                <div className="h-4 w-24 bg-slate-900/50 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-500/25">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-400 font-semibold">Profile Error</p>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">My Profile</h1>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-sm">
          <p className="font-semibold">Unable to load profile</p>
          <p className="mt-2 text-sm text-rose-100/80">{error}</p>
          <div className="mt-4">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-slate-900/50 text-slate-100 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <Loader2 className="mr-2 h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
            <User className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400 font-semibold">Account Profile</p>
        </div>
        <h1 className="mt-2 text-3xl font-bold text-white dark:text-slate-950">My Profile</h1>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Profile Details</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 h-14">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
                <User className="h-4 w-4 text-slate-400" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">User ID</p>
                  <p className="text-sm font-medium text-white">#{user?.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
                <Mail className="h-4 w-4 text-slate-400" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Email</p>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
                <CheckCircle className={user?.status === 'active' ? 'h-4 w-4 text-green-400' : 'h-4 w-4 text-slate-400'} />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Status</p>
                  <span className="text-sm font-medium text-white">
                    <Badge 
                      variant={user?.status === 'active' ? 'success' : user?.status === 'inactive' ? 'destructive' : 'secondary'}
                    >
                      {user?.status.charAt(0).toUpperCase() + user?.status.slice(1)}
                    </Badge>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
                <User className="h-4 w-4 text-slate-400" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Role</p>
                  <p className="text-sm font-medium text-white">
                    <Badge 
                      variant={
                        user?.role === 'admin' ? 'success' : 
                        user?.role === 'manager' ? 'primary' : 
                        user?.role === 'staff' ? 'secondary' : 
                        user?.role === 'customer' ? 'warning' : 
                        'muted'
                      }
                    >
                      {user?.role}
                    </Badge>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
                <User className="h-4 w-4 text-slate-400" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase">Member Since</p>
                  <p className="text-sm font-medium text-white">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions Card */}
        <Card className="p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-semibold">Account Actions</p>
          <div className="mt-4 space-y-3">
            <button 
              onClick={() => {
                // TODO: Implement edit profile functionality
                alert('Edit profile functionality coming soon');
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-900/50 text-slate-100 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <User className="mr-2 h-4 w-4" /> Edit Profile
            </button>

            <button 
              onClick={() => {
                // TODO: Implement change password functionality
                alert('Change password functionality coming soon');
              }}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-900/50 text-slate-100 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <Mail className="mr-2 h-4 w-4" /> Change Password
            </button>

            <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-slate-900/50">
              <User className="h-4 w-4 text-slate-400" />
              <div className="space-y-1">
                <p className="text-xs text-slate-500 uppercase">Last Login</p>
                <p className="text-sm font-medium text-white">Today, 2:30 PM</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}