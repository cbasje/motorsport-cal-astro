import type { APIRoute } from "astro";
import * as sessions from "$db/session-repository";
import type { SeriesId } from "$db/schema";

export const GET: APIRoute = async ({ request }) => {
	try {
		const params = new URL(request.url).searchParams;
		const seriesIds = params.get("series")?.split(",") as SeriesId[];

		const data = await sessions.getNextRaces(seriesIds);

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
