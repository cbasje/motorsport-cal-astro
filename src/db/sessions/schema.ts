import { rounds } from "$db/rounds/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { SessionType } from "./types";

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	number: integer("number").default(0).notNull(),
	start: timestamp("start").notNull(),
	end: timestamp("end").notNull(),
	roundId: text("round_id")
		.notNull()
		.references(() => rounds.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
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
