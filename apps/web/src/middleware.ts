import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (!user && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // All of `api` is excluded, not just `api/trpc`. This middleware only
    // reads the session cookie, but /api/trpc and /api/coach also accept an
    // `Authorization: Bearer` token from the mobile app, which sends no
    // cookies — redirecting those to /login made them unreachable from
    // mobile. Every API route authenticates itself: tRPC via
    // protectedProcedure, the two route handlers via their own 401 checks.
    // (/api/reports/csv is cookie-only and reachable from the web app alone.)
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
