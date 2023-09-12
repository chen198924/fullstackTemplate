import { mergeRouters } from '../trpc/trpc';
import { topRouter } from './topRouter';

export const appRouter = mergeRouters(
    topRouter
);
// export type definition of API
export type AppRouter = typeof appRouter;