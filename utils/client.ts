import type { AppRouter } from '@/server/trpcRouter';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

export let token: string;

const { env: { domain } } = process

export const clientServer = (cookie: any) => createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `${domain}/api/v1`,
            headers() {
                return {
                    Authorization: `Bearer ${cookie}`,
                    cookies: cookie,
                };
            },
        }),
    ],
});

export const clientBrowser = () => createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `/api/v1`,
            headers() {
                return {
                    cookies: undefined,
                };
            },
        }),
    ],
});

