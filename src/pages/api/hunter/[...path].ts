import { main as scrapeGeocoding } from "../../../hunter/src/controllers/geocoding";
import { main as resetDatabase } from "../../../hunter/src/controllers/reset-database";
import { main as scrape } from "../../../hunter/src/controllers/scraper";
import { main as scrapeWeather } from "../../../hunter/src/controllers/weather";
import { main as scrapeWikipedia } from "../../../hunter/src/controllers/wikipedia";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, params }) => {
	try {
		const query = new URL(request.url).searchParams;

		let data = {};
		switch (params.path) {
			case "scrape":
				data = await scrape();

				break;
			case "wikipedia":
				await scrapeWikipedia();

				break;
			case "weather":
				await scrapeWeather();

				break;
			case "geocode":
				await scrapeGeocoding();

				break;
			case "delete-season":
				// {
				// 	query: t.Object({ year: t.String(), include_current: t.Boolean() })
				// };
				const year = (query.get("year") ?? String(new Date().getFullYear() - 1)) as string;
				const includeCurrent = query.get("include_current") === "true";

				// await deleteSeason(year, includeCurrent);

				break;
			case "reset-database":
				// { query: t.Object({ sure: t.String() }) };
				const sure = query.get("sure") === "true";

				await resetDatabase(sure);

				break;
		}

		return new Response(JSON.stringify({ success: true, data }), {
			status: 200,
			headers: { "content-type": "application/json" }
		});
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ success: false, reason: error }), {
			status: 500,
			headers: { "content-type": "application/json" }
		});
	}
};
