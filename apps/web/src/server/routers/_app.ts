import { router } from '../trpc';
import { profileRouter } from './profile';
import { bgLogsRouter } from './bg-logs';
import { medicationsRouter } from './medications';
import { a1cRouter } from './a1c';
import { mealsRouter } from './meals';
import { foodScanRouter } from './food-scan';
import { coachRouter } from './coach';

export const appRouter = router({
  profile: profileRouter,
  bgLogs: bgLogsRouter,
  medications: medicationsRouter,
  a1c: a1cRouter,
  meals: mealsRouter,
  foodScan: foodScanRouter,
  coach: coachRouter,
});

export type AppRouter = typeof appRouter;
