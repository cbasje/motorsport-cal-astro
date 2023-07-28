import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./router";

export function getTrpcUrl() {
    if (typeof window !== "undefined")
        // browser should use relative path
        return "/api/trpc";

    return `${import.meta.env.SITE}/api/trpc`;
}

const trpc = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
        httpBatchLink({
            url: getTrpcUrl(),
        }),
    ],
});

export { trpc };
