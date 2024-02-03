import { connectionString } from "$db/drizzle";
import { authSessions, authUsers } from "$db/schema";
import type { AuthSession, AuthUser } from "$db/types";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Lucia } from "lucia";
import postgres from "pg";

const pool = new postgres.Pool({
	connectionString,
});
const db = drizzle(pool);

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
		DatabaseUserAttributes: AuthUser;
		DatabaseSessionAttributes: AuthSession;
	}
}
