'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Moon, Sun, LogOut, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/utils/classNames';
import { clearAuthSession } from '@/services/auth';
import { ROUTES } from '@/constants/routes';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/85 px-5 py-4 text-slate-100 shadow-panel backdrop-blur-xl backdrop-saturate-150 dark:bg-white/95 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex flex-1 items-center gap-3 rounded-3xl bg-slate-900/80 px-4 py-3 text-slate-400 shadow-inner shadow-slate-900/10">
          <Search className="h-4 w-4" />
          <input placeholder="Search orders, products, users" className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 dark:text-slate-950" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-100 transition hover:bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-950"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-100 transition hover:bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-950">
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-sm font-medium transition hover:bg-slate-800/90 dark:border-slate-200/20 dark:bg-white/90 dark:text-slate-950"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 text-sm font-semibold text-white">R</div>
            <span className="hidden sm:inline">Ravi</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-3 w-56 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-panel backdrop-blur-xl dark:border-slate-800 dark:bg-white/95">
              <div className="space-y-2 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Account</p>
                <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900/80 dark:text-slate-950">Profile</button>
                <button className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900/80 dark:text-slate-950">Settings</button>
                <button
                  className="flex w-full items-center gap-2 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300 transition hover:bg-rose-500/20"
                  onClick={() => {
                    clearAuthSession();
                    window.location.href = ROUTES.login;
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
