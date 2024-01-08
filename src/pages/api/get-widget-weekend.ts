import type { APIRoute } from "astro";
import * as sessions from "$db/session-repository";

export const GET: APIRoute = async () => {
	try {
		const data = await sessions.getNextSessionWidget();

		return new Response(
			JSON.stringify({
				success: true,
				data,
				h: {
					session: {
						type: "FP",
						number: 4,
						start: "2024-04-14T18:14:36.075Z",
						end: "2024-04-15T06:52:10.228Z",
						series: "F2"
					},
					weekOffset: -14742,
					series: []
				}
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
