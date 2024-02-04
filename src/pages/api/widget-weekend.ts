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
