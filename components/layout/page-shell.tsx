'use client';

import { motion } from 'framer-motion';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 dark:bg-white dark:text-slate-950">
      <div className="lg:flex lg:min-h-screen lg:items-start lg:gap-6 lg:px-6 xl:px-10">
        <Sidebar />
        <main className="flex-1 space-y-6 px-4 py-5 sm:px-6 lg:px-0 lg:py-8">
          <Navbar />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
