import type { APIRoute } from "astro";
import { getWeekend } from "../../../lib/utils/date";
import { appRouter } from "../server/router";

export const get: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const weekOffset = Number(params.get("offset"));
        const [startDate, endDate] = getWeekend(weekOffset);

        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        const data = await caller.rounds.getWeekends({ startDate, endDate });

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
