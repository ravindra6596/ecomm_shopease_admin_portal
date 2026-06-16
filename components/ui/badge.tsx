'use client';

import { cn } from '@/utils/classNames';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'primary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-md backdrop-blur-sm border',
        variant === 'default' && 'bg-slate-800/80 border-slate-700/50 text-slate-100 dark:bg-slate-200/80 dark:border-slate-300/50 dark:text-slate-950',
        variant === 'success' && 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-700',
        variant === 'warning' && 'bg-amber-500/15 border-amber-500/30 text-amber-300 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-700',
        variant === 'danger' && 'bg-rose-500/15 border-rose-500/30 text-rose-300 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-700',
        variant === 'muted' && 'bg-slate-700/80 border-slate-600/50 text-slate-300 dark:bg-slate-200/80 dark:border-slate-300/50 dark:text-slate-700',
        variant === 'primary' && 'bg-sky-500/15 border-sky-500/30 text-sky-300 dark:bg-sky-500/20 dark:border-sky-500/30 dark:text-sky-600',
        className
      )}
      {...props}
    />
  );
}
