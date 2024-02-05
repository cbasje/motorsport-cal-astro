import * as sessions from "$db/session-repository";
import type { SeriesId } from "$db/types";
import { errorRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	try {
		const query = new URL(request.url).searchParams;
		const seriesIds = query.get("series")?.split(",") as SeriesId[];

		const data = await sessions.getNextRaces(seriesIds);

		return successRes(undefined, undefined, data);
	} catch (error_) {
		return errorRes(error_);
	}
};
