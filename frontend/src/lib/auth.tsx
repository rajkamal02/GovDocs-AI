'use client';
import { useCallback } from 'react';
import { UserButton, useAuth } from '@clerk/nextjs';

export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const devToken = async () => 'dev';

function useClerkToken() { const { getToken } = useAuth(); return useCallback(() => getToken(), [getToken]); }
/** Returns a function that yields the session token. Build-time constant, so hook order never changes. */
export function useToken(): () => Promise<string | null> { return CLERK_ENABLED ? useClerkToken() : devToken; }

export function UserBadge() {
  if (CLERK_ENABLED) return <UserButton afterSignOutUrl="/" />;
  return <div title="Local dev mode (no login)" className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">ME</div>;
}
