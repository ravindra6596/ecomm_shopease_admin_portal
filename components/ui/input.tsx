'use client';

import { cn } from '@/utils/classNames';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-slate-950/80 focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-2 focus:ring-offset-slate-950 dark:border-slate-300/50 dark:bg-white/60 dark:text-slate-950 dark:placeholder:text-slate-400 dark:focus:border-sky-500/50 dark:focus:bg-white/80 dark:focus:ring-offset-white',
        className
      )}
      {...props}
    />
  );
}
