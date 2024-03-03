import type { APIRoute } from "astro";
import * as feed from "$db/feed/repository";
import { errorRes, feedRes } from "$lib/utils/response";
import { generateFeed } from "$db/feed/utils";

export const GET: APIRoute = async ({ locals }) => {
	try {
		const sessions = await feed.getAllSessions(locals.key?.series ?? undefined);

		const eventFeed = await generateFeed(sessions);

		return feedRes(eventFeed);
	} catch (error_) {
		return errorRes(error_);
	}
};
