import type { APIRoute } from "astro";
import * as sessions from "$db/session-repository";

export const GET: APIRoute = async ({ request }) => {
	try {
		const query = new URL(request.url).searchParams;
		const roundId = query.get("roundId");
		const now = query.get("now");

		const data = await sessions.getNextSession({
			roundId: roundId ?? undefined,
			now: now ? new Date(now) : undefined,
		});

		return new Response(
			JSON.stringify({
				success: true,
				data,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ success: false, reason: error }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
