'use client';

import { cn } from '@/utils/classNames';
import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ className, children }: CardProps) {
  return (
    <section className={cn('rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 to-slate-900/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-200/10 dark:from-white/95 dark:to-slate-50/95 transition-all duration-300 hover:border-white/20 dark:hover:border-slate-300/20', className)}>
      {children}
    </section>
  );
}
