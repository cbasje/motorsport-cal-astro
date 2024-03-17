import { circuits } from "$db/circuits/schema";
import { sessions } from "$db/sessions/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { SeriesId } from "./types";

export const rounds = pgTable("rounds", {
	id: text("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	title: text("title").notNull(),
	season: text("season").notNull(),
	link: text("link"),
	start: timestamp("start"),
	end: timestamp("end"),
	circuitId: integer("circuit_id")
		.notNull()
		.references(() => circuits.id, {
			onDelete: "set null",
			onUpdate: "set null",
		}),
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
