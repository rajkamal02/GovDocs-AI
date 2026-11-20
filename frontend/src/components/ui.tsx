'use client';
import clsx from 'clsx';
import { ReactNode, useEffect } from 'react';

export const Spinner = ({ className = '' }: { className?: string }) => (
  <span className={clsx('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />
);

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean; size?: 'sm' | 'md' | 'lg' };
export function Button({ variant = 'primary', loading, size = 'md', className, children, disabled, ...p }: BtnProps) {
  const v = { primary: 'bg-brand-600 text-white hover:bg-brand-700', secondary: 'bg-white text-slate-700 border border-slate-200 hover:border-brand-200 hover:text-brand-700', ghost: 'text-slate-600 hover:bg-slate-100', danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' }[variant];
  const s = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }[size];
  return (
    <button {...p} disabled={disabled || loading} className={clsx('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', v, s, className)}>
      {loading && <Spinner />}{children}
    </button>
  );
}

export const Card = ({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p} className={clsx('rounded-2xl border border-slate-200 bg-white', className)}>{children}</div>;
export const Badge = ({ children, color = '#64748b' }: { children: ReactNode; color?: string }) => <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: color + '1a', color }}>{children}</span>;

const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100';
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={clsx(field, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={clsx(field, p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={clsx(field, 'pr-8', p.className)} />;
export const Field = ({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) => (
  <label className={clsx('block', className)}><span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>{children}{hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}</label>
);

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-left">
      <span><span className="block text-sm font-medium">{label}</span>{hint && <span className="block text-[11px] text-slate-500">{hint}</span>}</span>
      <span className={clsx('relative h-6 w-11 shrink-0 rounded-full transition', on ? 'bg-brand-600' : 'bg-slate-300')}><span className={clsx('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-0.5')} /></span>
    </button>
  );
}

export function Modal({ title, sub, onClose, children, wide }: { title: string; sub?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title} className={clsx('max-h-[92vh] w-full animate-up overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0"><h2 className="font-display text-lg font-bold">{title}</h2>{sub && <p className="truncate text-xs text-slate-500">{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-xl leading-none text-slate-400 hover:bg-slate-100">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const Empty = ({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: ReactNode }) => (
  <div className="py-14 text-center"><div className="mb-3 text-5xl">{icon}</div><div className="font-display text-lg font-bold">{title}</div>{text && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{text}</p>}{action && <div className="mt-4">{action}</div>}</div>
);
export const PageHeader = ({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>
);
export const Loading = () => <div className="flex justify-center py-16 text-brand-600"><Spinner className="h-7 w-7" /></div>;
export const ErrorBox = ({ text, retry }: { text: string; retry?: () => void }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700"><div className="font-semibold">{text}</div>{retry && <Button className="mt-3" variant="secondary" size="sm" onClick={retry}>Try again</Button>}</div>
);
