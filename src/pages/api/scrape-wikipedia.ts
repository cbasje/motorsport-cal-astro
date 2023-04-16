import type { APIRoute } from "astro";
import { main } from "../../../lib/wikipedia";

export const get: APIRoute = async () => {
    try {
        const data = await main();

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
