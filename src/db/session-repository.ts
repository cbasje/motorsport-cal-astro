import { db } from "$db/drizzle";
import { z } from "zod";
import { seriesIds, sessions, type SeriesId, rounds, circuits } from "./schema";
import { eq, desc, asc, and, gte, lte, inArray } from "drizzle-orm";
import { getWeekendDates } from "$lib/utils/date";

// FIXME: log!

export const getOne = async (id: number) => {
	const [first] = await db
		.select()
		.from(sessions)
		.where(eq(sessions.id, id))
		.limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(sessions).orderBy(desc(sessions.start));
};

export const getNextRaces = async (ids: SeriesId[]) => {
	return await db
		.select({
			start: sessions.start,
			end: sessions.end,
			title: rounds.title,
			series: rounds.series,
		})
		.from(sessions)
		.leftJoin(rounds, eq(sessions.roundId, rounds.id))
		.where(
			and(
				eq(sessions.type, "R"),
				gte(sessions.end, new Date()),
				inArray(rounds.series, ids ?? seriesIds)
			)
		)
		.orderBy(asc(sessions.start));
};

export const getNextSession = async (input: {
	weekOffset?: number;
	now?: Date;
	roundId?: number;
}) => {
	const schema = z.object({
		weekOffset: z.number().int().min(-52).max(52).default(0),
		now: z.date().optional(),
		roundId: z.number().optional(),
	});

	const [start, end] = getWeekendDates(input.weekOffset);
	const [first] = await db
		.select({
			type: sessions.type,
			start: sessions.start,
			end: sessions.end,
			number: sessions.number,
			series: rounds.series,
			timezone: circuits.timezone,
		})
		.from(sessions)
		.leftJoin(rounds, eq(sessions.roundId, rounds.id))
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(
			and(
				input.roundId ? eq(sessions.roundId, input.roundId) : undefined,
				gte(sessions.end, input.now ?? start),
				lte(sessions.end, end)
			)
		)
		.orderBy(asc(sessions.start));
	return first;
};

export const getSessionsByRoundId = async (id: number) => {
	return await db
		.select({
			id: sessions.id,
			number: sessions.number,
			start: sessions.start,
			end: sessions.end,
			type: sessions.type,
		})
		.from(sessions)
		.leftJoin(rounds, eq(sessions.roundId, rounds.id))
		.where(eq(rounds.id, id))
		.orderBy(desc(sessions.start));
};
