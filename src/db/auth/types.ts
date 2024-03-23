import type { authKeys, authSessions, authUsers } from "astro:db";
import * as v from "valibot";

export const roles = ["ADMIN", "USER"] as const;
export type Role = (typeof roles)[number];

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthKey = typeof authKeys.$inferSelect;

export const LoginSchema = v.object({
	username: v.string("Your email must be a string", [
		v.minLength(3, "Please enter your email."),
		v.maxLength(31),
		v.regex(/^[a-z0-9_-]+$/, "The username is badly formatted."),
	]),
	password: v.string("Your password must be a string", [
		v.minLength(1, "Please enter your password."),
		v.minLength(6, "Your password must have 6 characters or more."),
		v.maxLength(255),
	]),
});
