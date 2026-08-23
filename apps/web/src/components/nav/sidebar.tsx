'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_GROUPS = [
  {
    label: 'Today',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/bg', label: 'Log BG' },
      { href: '/meals', label: 'Log Meal' },
      { href: '/medications', label: 'Medications' },
    ],
  },
  {
    label: 'Support',
    items: [
      { href: '/coach', label: 'AI Coach' },
      { href: '/reports', label: 'Reports' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-ink text-fg sm:w-60"
    >
      <Link
        href="/dashboard"
        className="flex h-16 items-center justify-center border-b border-ink-rule px-4 sm:justify-start sm:px-5"
      >
        <span className="font-display text-sm font-bold tracking-tight max-sm:hidden">
          DesiDiabetiCoach
        </span>
        <span aria-hidden className="font-display text-lg font-bold text-accent sm:hidden">
          D
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto py-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-7">
            <p className="eyebrow mb-2 px-5 text-fg/35 max-sm:hidden">{group.label}</p>
            <ul>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      title={item.label}
                      className={`relative flex items-center gap-3 px-5 py-2.5 text-sm transition-colors max-sm:justify-center max-sm:px-0 ${
                        active ? 'text-fg' : 'text-fg/55 hover:bg-fg/5 hover:text-fg'
                      }`}
                    >
                      {/* Active state is a saffron compartment marker, not a fill. */}
                      <span
                        aria-hidden
                        className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-accent transition-opacity ${
                          active ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <span className="max-sm:hidden">{item.label}</span>
                      <span aria-hidden className="font-mono text-xs sm:hidden">
                        {item.label.slice(0, 2)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink-rule py-3">
        {/* Carries the same active marker as the main groups — without it,
            nothing in the rail indicates you are on the settings page. */}
        <Link
          href="/settings"
          aria-current={pathname === '/settings' ? 'page' : undefined}
          className={`relative block px-5 py-2.5 text-sm transition-colors max-sm:text-center max-sm:text-xs ${
            pathname === '/settings' ? 'text-fg' : 'text-fg/55 hover:bg-fg/5 hover:text-fg'
          }`}
        >
          <span
            aria-hidden
            className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-accent transition-opacity ${
              pathname === '/settings' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full px-5 py-2.5 text-left text-sm text-fg/55 transition-colors hover:bg-fg/5 hover:text-fg max-sm:text-center max-sm:text-xs"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
