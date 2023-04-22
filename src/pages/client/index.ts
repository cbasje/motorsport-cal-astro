import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/router";

export function getTrpcUrl() {
    if (typeof window !== "undefined")
        // browser should use relative path
        return "/api/trpc";

    return `${import.meta.env.SITE}/api/trpc`;
}

const trpcAstro = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: getTrpcUrl(),
        }),
    ],
});

export { trpcAstro };
