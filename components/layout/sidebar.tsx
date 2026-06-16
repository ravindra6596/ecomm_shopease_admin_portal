'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Box, ShoppingCart, Heart, Tags, LogOut, Activity, Settings, ClipboardList, Bell, Image } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { ROUTES } from '@/constants/routes';

const navItems = [
    { href: ROUTES.dashboard, label: 'Dashboard', icon: Home },
    { href: ROUTES.users, label: 'Users', icon: Users },
    { href: ROUTES.categories, label: 'Categories', icon: Tags },
    { href: ROUTES.products, label: 'Products', icon: Box },
    { href: ROUTES.banners, label: 'Banners', icon: Image },
    { href: ROUTES.orders, label: 'Orders', icon: ClipboardList },
    { href: ROUTES.cart, label: 'Cart', icon: ShoppingCart },
    { href: ROUTES.wishlist, label: 'Wishlist', icon: Heart },
    { href: ROUTES.notifications, label: 'Notifications', icon: Bell },
    { href: ROUTES.accountProfile, label: 'Account', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-slate-200 shadow-panel backdrop-blur-xl lg:flex">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Ecommerce admin</p>
        <h2 className="text-2xl font-semibold tracking-tight">Store control panel</h2>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-colors duration-200',
                active ? 'bg-sky-500/10 text-sky-300' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto grid gap-3 rounded-[1.75rem] bg-slate-900/80 p-4 text-slate-300">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Pro account</p>
            <p className="text-xs text-slate-500">Access analytics and team controls</p>
          </div>
          <Activity className="h-5 w-5 text-sky-300" />
        </div>
        <button className="rounded-2xl bg-slate-800/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">Upgrade plan</button>
      </div>
    </aside>
  );
}
