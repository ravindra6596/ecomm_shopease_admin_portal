'use client';

import { cn } from '@/utils/classNames';
import type { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-3xl bg-slate-800/80 dark:bg-slate-200/30', className)} {...props} />;
}
