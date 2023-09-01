import type { APIRoute } from "astro";
import type { SeriesId } from "../../../lib/types";
import { appRouter } from "../../../lib/trpc/router";

export const GET: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const seriesIds = params.get("series")?.split(",") as SeriesId[];

        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        const data = await caller.rounds.getNextRaces(seriesIds);

        return new Response(
            JSON.stringify({
                success: true,
                data,
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
