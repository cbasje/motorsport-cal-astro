import type { APIRoute } from "astro";
import * as widget from "$db/widget-repository";

export const GET: APIRoute = async () => {
	try {
		const data = await widget.getNextSessionWidget();

		return new Response(
			JSON.stringify({
				success: data !== undefined,
				data,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		let message = "Error";
		if (error instanceof Error) {
			message = error.message;
		}
		console.error("🚨", message);
		return new Response(JSON.stringify({ success: false, message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
