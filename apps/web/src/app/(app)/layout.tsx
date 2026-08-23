import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/nav/sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarded_at')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.onboarded_at) redirect('/onboarding');
  }

  return (
    // `app-shell` is what globals.css keys the doubled type scale off.
    <div className="app-shell flex min-h-screen bg-ink">
      <Sidebar />
      {/* Content sits on a marginally raised ground so the rail still reads as
          a separate compartment without a hard light/dark seam down the page. */}
      <main className="min-w-0 flex-1 bg-ink-raised/40 px-5 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
