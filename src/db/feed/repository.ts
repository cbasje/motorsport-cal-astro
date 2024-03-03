import { circuits } from "$db/circuits/schema";
import { rounds } from "$db/rounds/schema";
import { seriesIds, type SeriesId } from "$db/rounds/types";
import { sessions } from "$db/sessions/schema";
import type { SessionType } from "$db/sessions/types";
import { db } from "$lib/server/db";
import { getWeekendDatesFromOffset } from "$lib/utils/date";
import { CustomError } from "$lib/utils/response";
import { and, asc, eq, gte, inArray, lte, notInArray, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";

// FIXME: log!

export const getAllSessions = async (preferredSeries: SeriesId[] = [...seriesIds]) => {
	const allEmptyRounds = db
		.select({
			type: sql<SessionType | null>`'R'`,
			number: sql<number>`0`,
			start: rounds.start,
			end: rounds.end,
			series: rounds.series,
			roundTitle: sql<string | null>`${rounds.title}`,
			link: rounds.link,
			circuitTitle: circuits.title,
			lat: circuits.lat,
			lon: circuits.lon,
		})
		.from(rounds)
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(
			and(
				notInArray(
					rounds.id,
					db.selectDistinct({ roundId: sessions.roundId }).from(sessions)
				),
				inArray(rounds.series, preferredSeries)
			)
		);

	const allSessions = db
		.select({
			type: sessions.type,
			number: sessions.number,
			start: sessions.start,
			end: sessions.end,
			series: rounds.series,
			roundTitle: rounds.title,
			link: rounds.link,
			circuitTitle: circuits.title,
			lat: circuits.lat,
			lon: circuits.lon,
		})
		.from(sessions)
		.leftJoin(rounds, eq(sessions.roundId, rounds.id))
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(inArray(rounds.series, preferredSeries));

	return await union(allEmptyRounds, allSessions);
};

export const getNextSessionWidget = async () => {
	return await db.transaction(async (tx) => {
		const [nextRound] = await tx
			.select({
				id: rounds.id,
				start: rounds.start,
				end: rounds.end,
				weekendOffset: sql<number>`DATE_PART('week', ${rounds.start}) - DATE_PART('week', NOW())`,
				series: rounds.series,
				country: circuits.country,
			})
			.from(rounds)
			.leftJoin(circuits, eq(circuits.id, rounds.circuitId))
			.where(gte(rounds.end, new Date()))
			.orderBy(asc(rounds.start))
			.limit(1);

		const [nextSession] = await tx
			.select({
				type: sessions.type,
				number: sessions.number,
				start: sessions.start,
				end: sessions.end,
				weekendOffset: sql<number>`DATE_PART('week', ${sessions.start}) - DATE_PART('week', NOW())`,
				series: rounds.series,
			})
			.from(sessions)
			.leftJoin(rounds, eq(sessions.roundId, rounds.id))
			.where(gte(sessions.end, new Date()))
			.orderBy(asc(sessions.start))
			.limit(1);

		if (!nextRound && !nextSession) throw new CustomError("Nothing in the future", 204);

		const weekendOffset = Math.max(0, nextRound?.weekendOffset ?? nextSession?.weekendOffset);
		const [start, end] = getWeekendDatesFromOffset(weekendOffset);

		const weekendRounds = await tx
			.select({
				series: rounds.series,
			})
			.from(rounds)
			.where(and(gte(rounds.end, start), lte(rounds.end, end)));

		return {
			firstRound: nextRound,
			session: nextSession,
			weekendOffset,
			series: [
				...new Set(
					weekendRounds
						.sort((a) => (a.series === nextSession.series ? 1 : 0)) // Prefer the series of nextSession
						.map((r) => r.series)
				),
			],
		};
	});
};
