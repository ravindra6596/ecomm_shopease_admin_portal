'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/classNames';
import { formatCurrency } from '@/utils/format';
import type { ReactNode } from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  highlight?: 'success' | 'warning' | 'primary';
}

export function SummaryCard({ title, value, subtitle, icon, highlight = 'primary' }: SummaryCardProps) {
  return (
    <motion.div whileHover={{ y: -4 }} className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold text-white dark:text-slate-950">{title === 'Revenue' || title === "Today\'s Revenue" || title === "Monthly Revenue" ? formatCurrency(value) : value}</h3>
        </div>
        <div className={cn('rounded-3xl p-3 text-white', highlight === 'success' && 'bg-emerald-500/90', highlight === 'warning' && 'bg-amber-500/90', highlight === 'primary' && 'bg-sky-500/90')}>
          {icon}
        </div>
      </div>
      <p className="mt-5 text-sm text-slate-400 dark:text-slate-500">{subtitle}</p>
    </motion.div>
  );
}
