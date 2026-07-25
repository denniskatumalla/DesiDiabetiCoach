import Link from 'next/link';
import { Button } from '@desidiabeticoach/ui';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-navy px-6 text-center text-white">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">DesiDiabetiCoach</h1>
      <p className="mt-4 max-w-xl text-lg text-white/80">
        Know Your Food. Manage Your Health. In Your Language.
      </p>
      <p className="mt-2 max-w-xl text-sm text-white/60">
        Culturally intelligent diabetes coaching for South Asian communities.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/signup">
          <Button>Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="ghost" className="text-white hover:text-brand-saffron">
            Log In
          </Button>
        </Link>
      </div>
    </main>
  );
}
