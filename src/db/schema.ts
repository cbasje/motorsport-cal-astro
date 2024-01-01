import { relations } from "drizzle-orm";
import { real, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const seriesIds = [
	"F1",
	"F2",
	"F3",
	"FE",
	"INDY",
	"WEC",
	"F1A",
] as const;
export type SeriesId = (typeof seriesIds)[number];

export const sessionTypes = ["R", "S", "SQ", "Q", "FP", "T"] as const;
export type SessionType = (typeof sessionTypes)[number];

export const weather = sqliteTable("weather", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	temp: real("temp").notNull(),
	weatherId: integer("weather_id", { mode: "number" }).notNull(),
	dt: integer("dt", { mode: "timestamp" }).notNull(),
	circuitId: integer("circuit_id", { mode: "number" }).notNull(),
});

const weatherRelations = relations(weather, ({ one }) => ({
	circuit: one(circuits, {
		fields: [weather.circuitId],
		references: [circuits.id],
	}),
}));

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;

export const circuits = sqliteTable("circuits", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	title: text("title").notNull().unique(),
	wikipediaPageId: integer("wikipedia_page_id", { mode: "number" }).unique(),
	locality: text("locality"),
	country: text("country"),
	timezone: text("timezone"),
	utcOffset: integer("utc_offset", { mode: "number" }),
	lon: real("lon"),
	lat: real("lat"),
});

const circuitRelations = relations(circuits, ({ many }) => ({
	rounds: many(rounds),
	weather: many(weather),
}));

export type Circuit = typeof circuits.$inferSelect;
export type NewCircuit = typeof circuits.$inferInsert;

export const rounds = sqliteTable("rounds", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	number: integer("number", { mode: "number" }).default(0).notNull(),
	title: text("title").notNull(),
	season: text("season").notNull(),
	link: text("link"),
	start: integer("start", { mode: "timestamp" }),
	end: integer("end", { mode: "timestamp" }),
	circuitId: integer("circuit_id", { mode: "number" }).notNull(),
	series: text("series").$type<SeriesId>(),
});

const roundRelations = relations(rounds, ({ one, many }) => ({
	circuit: one(circuits, {
		fields: [rounds.circuitId],
		references: [circuits.id],
	}),
	sessions: many(sessions),
}));

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert;

export const sessions = sqliteTable("sessions", {
	id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
	number: integer("number", { mode: "number" }).default(0).notNull(),
	start: integer("start", { mode: "timestamp" }).notNull(),
	end: integer("end", { mode: "timestamp" }).notNull(),
	roundId: integer("round_id", { mode: "number" }).notNull(),
	type: text("type").$type<SessionType>(),
});

const sessionRelations = relations(sessions, ({ one }) => ({
	round: one(rounds, {
		fields: [sessions.roundId],
		references: [rounds.id],
	}),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
