'use client';

import { cn } from '@/utils/classNames';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg hover:shadow-xl',
        variant === 'primary' && 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 focus:ring-sky-400',
        variant === 'secondary' && 'bg-slate-700/50 text-slate-100 hover:bg-slate-600/50 border border-slate-600/50 dark:bg-slate-200/80 dark:text-slate-950 dark:hover:bg-slate-300/80 dark:border-slate-300 focus:ring-slate-400',
        variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 dark:text-slate-900 dark:hover:bg-slate-200/50 dark:hover:border-slate-300/50 focus:ring-slate-400 shadow-none hover:shadow-md',
        variant === 'danger' && 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 focus:ring-rose-400',
        className
      )}
      {...props}
    />
  );
}
