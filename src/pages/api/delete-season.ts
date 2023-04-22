import type { APIRoute } from "astro";
import { appRouter } from "../server/router";

export const get: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const year = params.get("year") ?? String(new Date().getFullYear() - 1);
        const includeCurrent = params.get("include_current") === "true";

        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        await caller.database.deleteSeason({ year, includeCurrent });

        return new Response(
            JSON.stringify({
                success: true,
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
