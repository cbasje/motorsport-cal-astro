import * as sessions from "$db/sessions/repository";
import { errorRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
	try {
		const query = new URL(request.url).searchParams;
		const roundId = query.get("roundId");

		const data = await sessions.getNextSession({
			roundId: roundId ?? undefined,
			now: new Date(),
		});

		return successRes(data);
	} catch (error_) {
		return errorRes(error_);
	}
};
