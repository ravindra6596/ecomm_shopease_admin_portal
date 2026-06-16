'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-panel dark:border-slate-800 dark:bg-white/95"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Modal</p>
                <h2 className="text-xl font-semibold text-white dark:text-slate-950">{title}</h2>
              </div>
              <button onClick={onClose} className="rounded-full bg-slate-900/80 px-3 py-2 text-slate-200 transition hover:bg-slate-800/90 dark:bg-slate-200/90 dark:text-slate-950">
                Close
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
