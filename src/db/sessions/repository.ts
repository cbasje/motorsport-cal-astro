import { seriesIds, type SeriesId } from "$db/rounds/types";
import { getWeekendDatesFromOffset } from "$lib/utils/date";
import { and, asc, circuits, db, desc, eq, gte, inArray, lte, rounds, sessions } from "astro:db";
import * as v from "valibot";

// FIXME: log!

export const getOne = async (id: string) => {
	const [first] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
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
	roundId?: string;
}) => {
	const schema = v.object({
		weekOffset: v.number([v.integer(), v.minValue(-52), v.maxValue(52)]),
		now: v.optional(v.date()),
		roundId: v.optional(v.string()),
	});

	const [start, end] = getWeekendDatesFromOffset(input.weekOffset);
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
		.orderBy(asc(sessions.start))
		.limit(1);
	return first;
};

export const getSessionsByRoundId = async (id: string) => {
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
		.orderBy(asc(sessions.start));
};
