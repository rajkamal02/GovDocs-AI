import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
export default function Page() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) redirect('/dashboard');
  return <main className="grid min-h-screen place-items-center p-4"><SignIn /></main>;
}
