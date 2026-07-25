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
    <div className="flex min-h-screen bg-brand-white">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</div>
    </div>
  );
}
