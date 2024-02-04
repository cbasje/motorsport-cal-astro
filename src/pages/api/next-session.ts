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
	} catch (error_) {
		if (error_ instanceof Error) {
			console.error("🚨", error_);
			return new Response(JSON.stringify({ success: false, message: error_.message }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response(null, { status: 500 });
	}
};
