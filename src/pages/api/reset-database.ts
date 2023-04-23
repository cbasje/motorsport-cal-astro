import type { APIRoute } from "astro";
import { appRouter } from "../server/router";

export const get: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const sure = params.get("sure") === "true";

        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        await caller.database.reset({ sure });

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
