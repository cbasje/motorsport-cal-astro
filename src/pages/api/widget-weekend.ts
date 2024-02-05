import * as widget from "$db/widget-repository";
import { errorRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	try {
		const data = await widget.getNextSessionWidget();

		return successRes(undefined, undefined, data);
	} catch (error_) {
		return errorRes(error_);
	}
};
