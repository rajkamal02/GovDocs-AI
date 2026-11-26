import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const enabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isPublic = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/s/(.*)']);

export default enabled
  ? clerkMiddleware(
      async (auth, req) => {
        if (!isPublic(req)) {
          await auth.protect();
        }
      },
      {
        frontendApiProxy: {
          enabled: true,
        },
      }
    )
  : () => NextResponse.next();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
};
