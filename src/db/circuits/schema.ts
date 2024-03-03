import { rounds } from "$db/rounds/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { weather } from "$db/weather/schema";
import { relations } from "drizzle-orm";
import { integer, pgTable, real, serial, text } from "drizzle-orm/pg-core";

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
