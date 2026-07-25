import type { Metadata } from 'next';
import { TrpcProvider } from '@/lib/trpc/provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesiDiabetiCoach',
  description: 'Know Your Food. Manage Your Health. In Your Language.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
