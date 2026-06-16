'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ReactNode } from 'react';

interface OverviewChartProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  data: { month: string; revenue: number }[];
}

export function OverviewChart({ title, subtitle, icon, data }: OverviewChartProps) {
  // Provide fallback data if none is provided
  const chartData = data && data.length > 0 ? data : [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 6200 },
    { month: 'Apr', revenue: 7300 },
    { month: 'May', revenue: 8200 },
    { month: 'Jun', revenue: 9100 }
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{subtitle}</p>
          <h3 className="text-xl font-semibold text-white dark:text-slate-950">{title}</h3>
        </div>
        <div className="rounded-3xl bg-slate-900/90 p-3 text-sky-300 dark:bg-slate-200/90 dark:text-sky-600">{icon}</div>
      </div>
      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" />
            <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: 24, border: '1px solid rgba(148, 163, 184, 0.2)', backgroundColor: '#0f172a', color: '#fff' }} />
            <Area type="monotone" dataKey="revenue" stroke="#38bdf8" fill="url(#revenueGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
