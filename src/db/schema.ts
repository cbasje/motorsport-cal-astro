import { relations } from "drizzle-orm";
import {
	real,
	integer,
	pgTable,
	text,
	timestamp,
	serial,
} from "drizzle-orm/pg-core";

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

export const weather = pgTable("weather", {
	id: serial("id").primaryKey(),
	temp: real("temp").notNull(),
	weatherId: integer("weather_id").notNull(),
	dt: timestamp("dt").notNull(),
	circuitId: integer("circuit_id").notNull(),
});

const weatherRelations = relations(weather, ({ one }) => ({
	circuit: one(circuits, {
		fields: [weather.circuitId],
		references: [circuits.id],
	}),
}));

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;

export const circuits = pgTable("circuits", {
	id: serial("id").primaryKey(),
	title: text("title").notNull().unique(),
	wikipediaPageId: integer("wikipedia_page_id").unique(),
	locality: text("locality"),
	country: text("country"),
	timezone: text("timezone"),
	utcOffset: integer("utc_offset"),
	lon: real("lon"),
	lat: real("lat"),
});

const circuitRelations = relations(circuits, ({ many }) => ({
	rounds: many(rounds),
	weather: many(weather),
}));

export type Circuit = typeof circuits.$inferSelect;
export type NewCircuit = typeof circuits.$inferInsert;

export const rounds = pgTable("rounds", {
	id: serial("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	title: text("title").notNull(),
	season: text("season").notNull(),
	link: text("link"),
	start: timestamp("start"),
	end: timestamp("end"),
	circuitId: integer("circuit_id").notNull(),
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

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end").notNull(),
	roundId: integer("round_id").notNull(),
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
