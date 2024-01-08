import { relations } from "drizzle-orm";
import { integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { SeriesId, SessionType } from "./types";

export const weather = pgTable("weather", {
	id: serial("id").primaryKey(),
	temp: real("temp").notNull(),
	weatherId: integer("weather_id").notNull(),
	dt: timestamp("dt").notNull(),
	circuitId: integer("circuit_id").notNull(),
	updatedAt: timestamp("updated_at")
});

export const weatherRelations = relations(weather, ({ one }) => ({
	circuit: one(circuits, {
		fields: [weather.circuitId],
		references: [circuits.id]
	})
}));

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
	updatedAt: timestamp("updated_at")
});

export const circuitRelations = relations(circuits, ({ many }) => ({
	rounds: many(rounds),
	weather: many(weather)
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
	updatedAt: timestamp("updated_at")
});

export const roundRelations = relations(rounds, ({ one, many }) => ({
	circuit: one(circuits, {
		fields: [rounds.circuitId],
		references: [circuits.id]
	}),
	sessions: many(sessions)
}));

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end").notNull(),
	roundId: text("round_id").notNull(),
	type: text("type").$type<SessionType>(),
	updatedAt: timestamp("updated_at")
});

export const sessionRelations = relations(sessions, ({ one }) => ({
	round: one(rounds, {
		fields: [sessions.roundId],
		references: [rounds.id]
	})
}));
