import { config } from './middleware';

/**
 * The matcher decides which requests the auth middleware intercepts. It is
 * plain config, so nothing else in the suite exercises it — and a mistake
 * here is silent: the app still builds, web sessions still work, and only
 * the mobile app (which authenticates with a Bearer header rather than a
 * session cookie) breaks, because it gets redirected to /login before the
 * route handler can read its token.
 */

const matcher = new RegExp(`^${config.matcher[0]}$`);
const runsMiddleware = (pathname: string) => matcher.test(pathname);

describe('middleware matcher — API routes', () => {
  // These authenticate themselves (tRPC via protectedProcedure, the route
  // handlers via their own 401 checks) and must accept bearer tokens.
  it.each(['/api/coach', '/api/reports/csv', '/api/trpc/bgLogs.list', '/api/trpc/[trpc]'])(
    'does not intercept %s',
    (path) => {
      expect(runsMiddleware(path)).toBe(false);
    }
  );
});

describe('middleware matcher — page routes', () => {
  it.each(['/dashboard', '/bg', '/meals', '/medications', '/reports', '/settings', '/onboarding'])(
    'intercepts %s so an unauthenticated visitor is redirected',
    (path) => {
      expect(runsMiddleware(path)).toBe(true);
    }
  );

  // Public pages are still matched; middleware lets them through via
  // PUBLIC_PATHS rather than by being excluded from the matcher.
  it.each(['/', '/login', '/signup', '/auth/callback'])('intercepts public path %s', (path) => {
    expect(runsMiddleware(path)).toBe(true);
  });
});

describe('middleware matcher — static assets', () => {
  it.each(['/_next/static/chunks/main.js', '/_next/image', '/favicon.ico'])(
    'does not intercept %s',
    (path) => {
      expect(runsMiddleware(path)).toBe(false);
    }
  );
});
