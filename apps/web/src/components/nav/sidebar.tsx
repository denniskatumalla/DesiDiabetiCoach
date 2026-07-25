'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/bg', label: 'Log BG' },
  { href: '/meals', label: 'Log Meal' },
  { href: '/medications', label: 'Medications' },
  { href: '/coach', label: 'AI Coach' },
  { href: '/reports', label: 'Reports' },
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
    <nav className="flex h-screen w-60 flex-col border-r border-brand-navy/10 bg-white px-3 py-6">
      <Link href="/dashboard" className="mb-8 px-3 font-display text-lg font-bold text-brand-navy">
        DesiDiabetiCoach
      </Link>

      <ul className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-control px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-l-2 border-brand-teal bg-brand-teal/5 text-brand-teal'
                    : 'text-brand-navy/70 hover:bg-brand-navy/5'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1 border-t border-brand-navy/10 pt-3">
        <Link href="/settings" className="block rounded-control px-3 py-2 text-sm text-brand-navy/70 hover:bg-brand-navy/5">
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full rounded-control px-3 py-2 text-left text-sm text-brand-navy/70 hover:bg-brand-navy/5"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
