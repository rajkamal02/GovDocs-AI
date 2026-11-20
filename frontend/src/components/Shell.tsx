'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { UserBadge, CLERK_ENABLED } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' }, { href: '/vault', icon: '🗂️', label: 'My Documents' }, { href: '/upload', icon: '⬆️', label: 'Upload Center' },
  { href: '/presets', icon: '🎯', label: 'Govt Presets' }, { href: '/packages', icon: '📦', label: 'Ready Packages' }, { href: '/ai-tools', icon: '🤖', label: 'AI Tools' },
  { href: '/downloads', icon: '📥', label: 'Downloads' }, { href: '/share', icon: '🔗', label: 'Share Center' }, { href: '/settings', icon: '⚙️', label: 'Settings' },
];
const BOTTOM = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[5]];

function Links({ onClick }: { onClick?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((n) => {
        const on = path === n.href || path.startsWith(n.href + '/');
        return (
          <Link key={n.href} href={n.href} onClick={onClick} className={clsx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', on ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50')}>
            <span className="w-5 text-center text-lg">{n.icon}</span>{n.label}
          </Link>
        );
      })}
    </nav>
  );
}
const Logo = () => (
  <Link href="/dashboard" className="flex items-center gap-2.5">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-lg">🏛️</span>
    <span className="font-display text-lg font-bold">GovDocs <span className="text-brand-600">AI</span></span>
  </Link>
);

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-6 px-2 pt-1"><Logo /></div>
        <div className="flex-1 overflow-y-auto"><Links /></div>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3"><UserBadge /><div className="text-xs"><div className="font-semibold">{CLERK_ENABLED ? 'My account' : 'Local mode'}</div><div className="text-slate-500">{CLERK_ENABLED ? 'Secure session' : 'No login needed'}</div></div></div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-2"><UserBadge /><button onClick={() => setOpen(true)} aria-label="Menu" className="rounded-lg p-2 text-xl hover:bg-slate-100">☰</button></div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50" />
          <div className="absolute right-0 top-0 h-full w-72 animate-up overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} className="text-2xl text-slate-400">×</button></div>
            <Links onClick={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="px-4 pb-24 pt-5 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-8"><div className="mx-auto max-w-6xl animate-up" key={path}>{children}</div></main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {BOTTOM.map((n) => {
          const on = path === n.href || path.startsWith(n.href + '/');
          return <Link key={n.href} href={n.href} className={clsx('flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium', on ? 'text-brand-700' : 'text-slate-500')}><span className="text-xl">{n.icon}</span>{n.label.split(' ')[0]}</Link>;
        })}
      </nav>
    </div>
  );
}
