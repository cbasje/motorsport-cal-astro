import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { roles, type SeriesId, type SessionType } from "./types";

export const createdAt = timestamp("created_at", {
	precision: 3,
	mode: "date",
})
	.defaultNow()
	.notNull();
export const updatedAt = timestamp("updated_at", {
	precision: 3,
	mode: "date",
}).notNull();

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
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => authUsers.id),
	apiKey: text("api_key").notNull(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
});

export const circuits = pgTable("circuits", {
	id: serial("id").primaryKey(),
	title: text("title").notNull().unique(),
	usedTitles: text("used_titles").array(),
	wikipediaPageId: integer("wikipedia_page_id").unique(),
	locality: text("locality"),
	country: text("country"),
	timezone: text("timezone"),
	utcOffset: integer("utc_offset"),
	lon: real("lon"),
	lat: real("lat"),
	createdAt,
	updatedAt,
});

export const circuitRelations = relations(circuits, ({ many }) => ({
	rounds: many(rounds),
	weather: many(weather),
}));

export const rounds = pgTable("rounds", {
	id: text("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	title: text("title").notNull(),
	season: text("season").notNull(),
	link: text("link"),
	start: timestamp("start"),
	end: timestamp("end"),
	circuitId: integer("circuit_id").notNull(),
	series: text("series").$type<SeriesId>(),
	createdAt,
	updatedAt,
});

export const roundRelations = relations(rounds, ({ one, many }) => ({
	circuit: one(circuits, {
		fields: [rounds.circuitId],
		references: [circuits.id],
	}),
	sessions: many(sessions),
}));

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end").notNull(),
	roundId: text("round_id").notNull(),
	type: text("type").$type<SessionType>(),
	createdAt,
	updatedAt,
});

export const sessionRelations = relations(sessions, ({ one }) => ({
	round: one(rounds, {
		fields: [sessions.roundId],
		references: [rounds.id],
	}),
}));

export const weather = pgTable("weather", {
	id: serial("id").primaryKey(),
	temp: real("temp").notNull(),
	weatherId: integer("weather_id").notNull(),
	dt: timestamp("dt").notNull(),
	circuitId: integer("circuit_id").notNull(),
	createdAt,
	updatedAt,
});

export const weatherRelations = relations(weather, ({ one }) => ({
	circuit: one(circuits, {
		fields: [weather.circuitId],
		references: [circuits.id],
	}),
}));
