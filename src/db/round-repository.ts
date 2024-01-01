import { db } from "$db/drizzle";
import { z } from "zod";
import { circuits, rounds, sessions } from "./schema";
import { eq, asc, and, gte, lte, sql } from "drizzle-orm";
import { getWeekendDates } from "$lib/utils/date";

// FIXME: log!

export const getOne = async (id: number) => {
	const [first] = await db
		.select({
			id: rounds.id,
			number: rounds.number,
			title: rounds.title,
			season: rounds.season,
			link: rounds.link,
			start: rounds.start,
			end: rounds.end,
			circuitId: rounds.circuitId,
			series: rounds.series,
			timezone: circuits.timezone,
		})
		.from(rounds)
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(eq(rounds.id, id))
		.limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(rounds).orderBy(asc(rounds.series));
};

export const getWeekend = async (input: { weekOffset: number; now?: Date }) => {
	const schema = z.object({
		weekOffset: z.number().int().min(-52).max(52).default(0),
		now: z.date().optional(),
		showSessions: z.boolean().optional().default(false),
	});

	const [start, end] = getWeekendDates(input.weekOffset);
	const w = await db
		.select({
			id: rounds.id,
			title: rounds.title,
			series: rounds.series,
			start: rounds.start,
			end: rounds.end,
			sessionCount: sql<number>`count(${sessions.id})`,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
		})
		.from(rounds)
		.leftJoin(sessions, eq(rounds.id, sessions.roundId))
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(and(gte(rounds.start, start), lte(rounds.end, end)))
		.orderBy(asc(rounds.series));
	return w;
};
