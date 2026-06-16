'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, getAuthUser } from '@/services/auth';
import type { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const cachedUser = getAuthUser();

    if (!token) {
      router.replace('/login');
      return;
    }

    setUser(cachedUser);
    setLoading(false);
  }, [router]);

  return { user, loading };
}
