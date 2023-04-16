import type { APIRoute } from "astro";
import { main } from "../../../lib/scraper";

export const get: APIRoute = async () => {
    try {
        await main();

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
