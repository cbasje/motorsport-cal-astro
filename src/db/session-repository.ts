import { db } from "$db/drizzle";
import { getWeekendDates, getWeekendOffset } from "$lib/utils/date";
import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { z } from "zod";
import { circuits, rounds, sessions } from "./schema";
import { seriesIds, type SeriesId } from "./types";

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
	const schema = z.object({
		weekOffset: z.number().int().min(-52).max(52).default(0),
		now: z.date().optional(),
		roundId: z.string().optional(),
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
		.orderBy(asc(sessions.start))
		.limit(1);
	return first;
};

export const getNextSessionWidget = async () => {
	return await db.transaction(async (tx) => {
		const [nextRound] = await tx
			.select({
				start: rounds.start,
				end: rounds.end,
				series: rounds.series,
			})
			.from(rounds)
			.where(gte(rounds.end, new Date()))
			.orderBy(asc(rounds.start))
			.limit(1);

		const [nextSession] = await tx
			.select({
				type: sessions.type,
				number: sessions.number,
				start: sessions.start,
				end: sessions.end,
				series: rounds.series,
			})
			.from(sessions)
			.leftJoin(rounds, eq(sessions.roundId, rounds.id))
			.where(gte(sessions.end, new Date()))
			.orderBy(asc(sessions.start))
			.limit(1);

		const weekendOffset = getWeekendOffset(nextRound.start ?? nextSession.start);

		const [start, end] = getWeekendDates(weekendOffset);
		const weekendRounds = await tx
			.select({
				series: rounds.series,
			})
			.from(rounds)
			.where(and(gte(rounds.end, start), lte(rounds.end, end)))
			.limit(1);

		return {
			firstRound: nextRound,
			session: nextSession,
			weekendOffset,
			series: weekendRounds.map((r) => r.series),
		};
	});
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
		.orderBy(desc(sessions.start));
};
