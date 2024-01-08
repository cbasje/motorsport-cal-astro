import type { APIRoute } from "astro";
import * as sessions from "$db/session-repository";

export const GET: APIRoute = async () => {
	try {
		const data = await sessions.getNextSessionWidget();

		return new Response(
			JSON.stringify({
				success: data !== undefined,
				data
			})
		);
	} catch (error) {
		let message = "Error";
		if (error instanceof Error) {
			message = error.message;
		}
		console.error("🚨", message);
		return new Response(JSON.stringify({ success: false, message }), {
			status: 500
		});
	}
};
