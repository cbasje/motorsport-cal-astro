import { lucia } from "$lib/auth";
import { CustomError, errorRes } from "$lib/utils/response";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
	if (!locals.session) return errorRes(new CustomError("No session", 401));

	await lucia.invalidateSession(locals.session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	return redirect("/auth/login");
};
