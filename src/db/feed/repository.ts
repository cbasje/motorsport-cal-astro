import { seriesIds, type SeriesId } from "$db/rounds/types";
import type { SessionType } from "$db/sessions/types";
import { getWeekendDatesFromOffset } from "$lib/utils/date";
import { CustomError } from "$lib/utils/response";
import {
	and,
	asc,
	circuits,
	db,
	eq,
	gte,
	inArray,
	lte,
	notInArray,
	rounds,
	sessions,
	sql,
} from "astro:db";

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

	return allEmptyRounds.union(allSessions);
};

export const getNextSessionWidget = async () => {
	const [nextRound] = await db
		.select({
			id: rounds.id,
			start: rounds.start,
			end: rounds.end,
			weekendOffset: sql`strftime('%W', ${rounds.start}) - strftime('%W', 'now')`.mapWith(
				Number
			),
			series: rounds.series,
			country: circuits.country,
		})
		.from(rounds)
		.leftJoin(circuits, eq(circuits.id, rounds.circuitId))
		.where(gte(rounds.end, new Date()))
		.orderBy(asc(rounds.start))
		.limit(1);

	const [nextSession] = await db
		.select({
			type: sessions.type,
			number: sessions.number,
			start: sessions.start,
			end: sessions.end,
			weekendOffset: sql`strftime('%W', ${sessions.start}) - strftime('%W', 'now')`.mapWith(
				Number
			),
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

	const weekendRounds = await db
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
};
