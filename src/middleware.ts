import { db } from "$db/drizzle";
import { authKeys, authUsers } from "$db/schema";
import { getApiKey } from "$lib/utils/api";
import { CustomError, debugRes, errorRes } from "$lib/utils/response";
import { defineMiddleware } from "astro:middleware";
import { SQL, and, eq, gte, isNotNull } from "drizzle-orm";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/auth";

export const onRequest = defineMiddleware(
	async ({ locals, cookies, request, url, redirect }, next) => {
		if (request.method !== "GET") {
			const originHeader = request.headers.get("Origin");
			const hostHeader = request.headers.get("Host");
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				return errorRes(new CustomError("Incorrect Origin", 403));
			}
		}

		const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			locals.user = null;
			locals.session = null;

			if (shouldProtectRoute(url) === true && isApiRoute(url) === false)
				return redirect(handleLoginRedirect(url));

			if (isApiRoute(url) === true) {
				try {
					// TODO: start session?

					const apiKey = getApiKey(url, request.headers);

					const { key, user } = await checkApiKey(apiKey);
					if (user) {
						locals.user = user;
						locals.key = key;
					}
				} catch (error_) {
					return debugRes(error_, "🔑");
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
	return (
		(url.pathname.startsWith("/api/") === true &&
			url.pathname.startsWith("/api/auth/") === false) ||
		url.pathname.startsWith("/feed.ics") === true
	);
};

const isAdminRoute = (url: URL) => {
	// Only /admin require ADMIN role
	return url.pathname.startsWith("/admin/") === true;
};

const checkApiKey = async (apiKey: string | null) => {
	if (!apiKey) throw new CustomError("No 'apiKey' included", 401);

	const [existingKey] = await db
		.select({
			apiKey: authKeys.apiKey,
			userId: authKeys.userId,
			roles: authKeys.role,
			series: authKeys.series,
		})
		.from(authKeys)
		.where(and(eq(authKeys.apiKey, apiKey), gte(authKeys.expiresAt, new Date())));
	if (!existingKey) throw new CustomError("'apiKey' is not valid", 401);

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

	return {
		key: existingKey,
		user,
	};
};
