import * as feed from "$db/feed/repository";
import { errorRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	try {
		const data = await feed.getNextSessionWidget();

		return successRes(data);
	} catch (error_) {
		return errorRes(error_);
	}
};
