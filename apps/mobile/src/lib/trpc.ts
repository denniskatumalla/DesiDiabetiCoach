import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
// Type-only import — no server code bundled into the mobile app.
import type { AppRouter } from '../../../web/src/server/routers/_app';
import { supabase } from './supabase';

export const trpc = createTRPCReact<AppRouter>();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        async headers() {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
