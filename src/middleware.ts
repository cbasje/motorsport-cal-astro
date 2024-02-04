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
				return new Response(
					JSON.stringify({ success: false, message: "Incorrect Origin" }),
					{
						status: 403,
					}
				);
			}
		}

		const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			locals.user = null;
			locals.session = null;

			if (shouldProtectRoute(url) === true) return redirect(handleLoginRedirect(url));

			if (isApiRoute(url) === true) {
				try {
					// TODO: start session?

					const apiKey = getApiKey(url, request.headers);
					locals.apiKey = apiKey;

					const userFromApiKey = await checkApiKey(apiKey);
					if (userFromApiKey) locals.user = userFromApiKey;
				} catch (error_) {
					if (error_ instanceof Error) {
						console.error("🚨 ~ middleware", error_);
						return new Response(
							JSON.stringify({
								success: false,
								message: error_.message,
							}),
							{
								status: 401,
								headers: { "Content-Type": "application/json" },
							}
						);
					}
				}
			}

			return next();
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

		if (isAdminRoute(url) === true && user?.role === "ADMIN") {
			return redirect("/");
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

const isApiRoute = (url: URL) => {
	// Only /api pages require apiKey
	return url.pathname.startsWith("/api/") === true;
};

const isAdminRoute = (url: URL) => {
	// Only /admin require ADMIN role
	return url.pathname.startsWith("/admin/") === true;
};

const checkApiKey = async (apiKey: string | null) => {
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
