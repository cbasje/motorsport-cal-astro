import { getWeekendDatesFromOffset } from "$lib/utils/date";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./drizzle";
import { circuits, rounds, sessions } from "./schema";

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

		const weekendOffset = Math.max(0, nextRound.weekendOffset ?? nextSession.weekendOffset);
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
