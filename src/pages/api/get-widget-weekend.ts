import type { APIRoute } from "astro";
import * as rounds from "$db/round-repository";
import * as sessions from "$db/session-repository";

export const GET: APIRoute = async () => {
	try {
		const now = new Date();
		const [weekend, session] = await Promise.all([
			rounds.getWeekend({
				weekOffset: 0,
				now,
			}),
			sessions.getNextSession({
				now,
			}),
		]);

		return new Response(
			JSON.stringify({
				success: true,
				data: { rounds: weekend, session },
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
