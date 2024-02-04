import type { APIRoute } from "astro";
import { main as deleteSeason } from "../../../hunter/controllers/delete-season";
import { main as huntGeocoding } from "../../../hunter/controllers/geocoding";
import { main as hunt } from "../../../hunter/controllers/hunt";
import { main as resetDatabase } from "../../../hunter/controllers/reset-database";
import { main as huntWeather } from "../../../hunter/controllers/weather";
import { main as huntWikipedia } from "../../../hunter/controllers/wikipedia";

export const GET: APIRoute = async ({ request, params }) => {
	try {
		const query = new URL(request.url).searchParams;

		let data = {};
		switch (params.path) {
			case "hunt":
				data = await hunt();

				break;
			case "wikipedia":
				data = await huntWikipedia();

				break;
			case "weather":
				data = await huntWeather();

				break;
			case "geocode":
				data = await huntGeocoding();

				break;
			case "delete-season":
				// {
				// 	query: t.Object({ year: t.String(), include_current: t.Boolean() })
				// };
				const year = (query.get("year") ?? String(new Date().getFullYear() - 1)) as string;
				const includeCurrent = query.get("include_current") === "true";

				data = await deleteSeason(year, includeCurrent);

				break;
			case "reset-database":
				// { query: t.Object({ sure: t.String() }) };
				const sure = query.get("sure") === "true";

				data = await resetDatabase(sure);

				break;
		}

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
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
