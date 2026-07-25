import { SignupForm } from './signup-form';

// See login/page.tsx for why this split (server page + client form) exists.
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return <SignupForm />;
}
