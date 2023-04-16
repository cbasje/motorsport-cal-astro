import type { APIRoute } from "astro";
import { main } from "@/lib/scraper";

export const get: APIRoute = async () => {
    try {
        await main();

        return new Response(
            JSON.stringify({
                success: true,
            })
        );
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
        });
    }
};
