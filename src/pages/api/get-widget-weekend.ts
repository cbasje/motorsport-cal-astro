import type { APIRoute } from "astro";
import { appRouter } from "../../../lib/trpc/router";

export const GET: APIRoute = async ({ request }) => {
    try {
        const now = new Date();
        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        const [rounds, session] = await Promise.all([
            caller.rounds.getWeekend({
                weekOffset: 0,
                now,
            }),
            caller.sessions.getNextSession({
                now,
            }),
        ]);

        return new Response(
            JSON.stringify({
                success: true,
                data: { rounds, session },
            })
        );
    } catch (error) {
        let message = "Error";
        if (error instanceof Error) {
            message = error.message;
        }
        console.error("🚨", message);
        return new Response(JSON.stringify({ success: false, message }), {
            status: 500,
        });
    }
};
