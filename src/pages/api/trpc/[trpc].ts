import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { APIRoute } from "astro";
import { appRouter } from "../../../../lib/trpc/router";
import { createContext } from "../../../../lib/trpc/server";

export const all: APIRoute = ({ request }) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: request,
        router: appRouter,
        createContext,
    });
};
