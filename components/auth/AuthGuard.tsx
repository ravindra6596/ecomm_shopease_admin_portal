'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthToken } from '@/services/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        router.replace('/login');
      }
    } else {
      setAuthenticated(true);
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return <>{authenticated || pathname.startsWith('/login') || pathname.startsWith('/register') ? children : null}</>;
}
