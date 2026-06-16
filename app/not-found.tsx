import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-12 text-center shadow-panel backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-slate-400">The page you were looking for does not exist or has been moved.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">Go back home</Link>
      </div>
    </div>
  );
}
