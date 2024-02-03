import { db } from "$db/drizzle";
import { authKeys, authUsers } from "$db/schema";
import type { Role } from "$db/types";
import { defineMiddleware } from "astro:middleware";
import { SQL, and, eq, gte, isNotNull } from "drizzle-orm";
import { getApiKey } from "$lib/utils/api";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/auth";

export const onRequest = defineMiddleware(
	async ({ locals, cookies, request, url, redirect }, next) => {
		if (request.method !== "GET") {
			const originHeader = request.headers.get("Origin");
			const hostHeader = request.headers.get("Host");
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				return new Response(null, {
					status: 403,
				});
			}
		}

		const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			locals.user = null;
			locals.session = null;

			if (shouldProtectRoute(url)) return redirect(handleLoginRedirect(url));
			else return next();
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		locals.session = session;
		locals.user = user;

		const hasAdmin = checkAdmin(url, user?.role);
		if (hasAdmin === true) {
			return redirect("/");
		}

		try {
			const apiKey = getApiKey(url, request.headers);
			locals.apiKey = apiKey;

			const userFromApiKey = await checkApiKey(url, apiKey, user?.role);
			if (userFromApiKey && !user) locals.user = userFromApiKey;
		} catch (error_) {
			if (error_ instanceof Error) console.debug("🚨 ~ middleware", error_.message);
		}

		return next();
	}
);

const handleLoginRedirect = (url: URL) => {
	// Allow redirection after logging in
	const redirectTo = url.pathname + url.search;
	return `/auth/login?redirectTo=${redirectTo}`;
};

const shouldProtectRoute = (url: URL) => {
	// Only non-/auth pages should have authentication
	return (
		url.pathname.startsWith("/auth/") === false &&
		url.pathname.startsWith("/api/auth/") === false
	);
};

const checkAdmin = (url: URL, role: Role | null | undefined) => {
	// Only /admin require ADMIN role
	return url.pathname.startsWith("/admin/") === true && role === "ADMIN";
};

const checkApiKey = async (url: URL, apiKey: string | null, role: Role | null | undefined) => {
	// Only /api pages require apiKey
	if (!url.pathname.startsWith("/api/")) return;

	// If ADMIN, they are allowed everything
	if (role === "ADMIN") return;

	if (!apiKey) throw new Error("No 'apiKey' included");

	const [existingKey] = await db
		.select({ apiKey: authKeys.apiKey, userId: authKeys.userId })
		.from(authKeys)
		.where(and(eq(authKeys.apiKey, apiKey), gte(authKeys.expiresAt, new Date())));
	if (!existingKey) throw new Error("'apiKey' is not valid");

	// Get user from the apiKey
	const [user] = await db
		.select({
			id: authUsers.id,
			username: authUsers.username,
			email: authUsers.email,
			role: authUsers.role,
			hasTwoFactor: isNotNull(authUsers.twoFactorSecret) as SQL<boolean>,
		})
		.from(authUsers)
		.where(eq(authUsers.id, existingKey.userId));

	return user;
};
