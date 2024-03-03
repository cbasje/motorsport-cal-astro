import { circuits } from "$db/circuits/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { relations } from "drizzle-orm";
import { integer, pgTable, real, serial, timestamp } from "drizzle-orm/pg-core";

export const weather = pgTable("weather", {
	id: serial("id").primaryKey(),
	temp: real("temp").notNull(),
	weatherId: integer("weather_id").notNull(),
	dt: timestamp("dt").notNull(),
	circuitId: integer("circuit_id")
		.notNull()
		.references(() => circuits.id),
	createdAt,
	updatedAt,
});

export const weatherRelations = relations(weather, ({ one }) => ({
	circuit: one(circuits, {
		fields: [weather.circuitId],
		references: [circuits.id],
	}),
}));
