import { authSessions, authUsers } from "$db/auth/schema";
import type { AuthSession, AuthUser } from "$db/auth/types";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { db } from "./db";

const adapter = new DrizzlePostgreSQLAdapter(db, authSessions, authUsers);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: import.meta.env.PROD === "true",
		},
	},
	getUserAttributes: (dbUser) => {
		return {
			// `id` included by default!
			username: dbUser.username,
			email: dbUser.email,
			role: dbUser.role,
			// don't expose the secret
			// rather expose whether if the user has setup 2fa
			hasTwoFactor: dbUser.twoFactorSecret !== null,
		};
	},
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<AuthUser, "id">;
		DatabaseSessionAttributes: Omit<AuthSession, "id" | "userId" | "expiresAt">;
	}
}
