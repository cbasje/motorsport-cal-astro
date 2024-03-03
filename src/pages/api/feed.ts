import * as feed from "$db/feed-repository";
import { errorRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
	try {
		const sessions = await feed.getAllSessions(locals.key?.series ?? undefined);

		return successRes(sessions);
	} catch (error_) {
		return errorRes(error_);
	}
};
