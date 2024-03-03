import type { SeriesId } from "$db/rounds/types";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { roles, type Role } from "./types";

export const authUsers = pgTable("auth_user", {
	id: text("id").primaryKey(),
	username: text("username").notNull(),
	email: text("email"),
	hashedPassword: text("hashed_password").notNull(),
	twoFactorSecret: text("two_factor_secret"),
	role: text("role", { enum: roles }).default("USER"),
	createdAt,
	updatedAt,
});

export const authSessions = pgTable("auth_session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => authUsers.id),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

// Table for the API keys
export const authKeys = pgTable("auth_keys", {
	apiKey: text("api_key").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => authUsers.id),
	role: text("role").$type<Role>(),
	series: text("series").array().$type<SeriesId[]>(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
	createdAt,
	updatedAt,
});
