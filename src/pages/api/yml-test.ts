import type { APIRoute } from "astro";
import scraperData from "lib/scraper-data";

export const get: APIRoute = async () => {
    try {
        let data = scraperData;

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
