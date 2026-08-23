import type { Metadata } from 'next';
import { TrpcProvider } from '@/lib/trpc/provider';
import { THEME_BOOT_SCRIPT } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesiDiabetiCoach',
  description: 'Know Your Food. Manage Your Health. In Your Language.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Applies the stored theme before first paint. Without it a user who
          chose light sees a flash of the dark default, because the server has
          no way to know their preference.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
