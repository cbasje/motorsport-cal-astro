import { db } from "$db/drizzle";
import { z } from "zod";
import { circuits, rounds, sessions } from "./schema";
import { eq, asc, and, gte, lte, sql, desc } from "drizzle-orm";
import { getWeekendDates, getWeekendOffset } from "$lib/utils/date";
import { groupBy } from "lodash";

// FIXME: log!

const sessionSq = db.$with("children").as(
	db
		.select({
			roundId: sessions.roundId,
			count: sql<number>`count(*)::int`.as("count"),
		})
		.from(sessions)
		.groupBy(sessions.roundId)
);

export const getOne = async (id: string) => {
	const [first] = await db
		.with(sessionSq)
		.select({
			id: sessionSq.roundId,
			number: rounds.number,
			title: rounds.title,
			season: rounds.season,
			link: rounds.link,
			start: rounds.start,
			end: rounds.end,
			circuitId: rounds.circuitId,
			series: rounds.series,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
			timezone: circuits.timezone,
			sessionCount: sessionSq.count,
		})
		.from(rounds)
		.leftJoin(sessionSq, eq(sessionSq.roundId, rounds.id))
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(eq(rounds.id, id))
		.limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(rounds).orderBy(asc(rounds.series));
};

export const getWeekends = async (input: {
	startOffset: number | undefined;
	endOffset: number | undefined;
}) => {
	const schema = z.object({
		startOffset: z.number().int().min(-52).max(52).default(0),
		endOffset: z.number().int().min(-52).max(52).default(0),
	});

	const [start, end] = getWeekendDates(input.startOffset, input.endOffset);

	const allRounds = await db
		.with(sessionSq)
		.select({
			id: rounds.id,
			title: rounds.title,
			series: rounds.series,
			start: rounds.start,
			end: rounds.end,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
			sessionCount: sessionSq.count,
		})
		.from(rounds)
		.leftJoin(sessionSq, eq(sessionSq.roundId, rounds.id))
		.leftJoin(circuits, eq(circuits.id, rounds.circuitId))
		.where(and(gte(rounds.start, start), lte(rounds.end, end)))
		.orderBy(desc(rounds.start), asc(rounds.series));
	return groupBy(allRounds, (r) => getWeekendOffset(r.start));
};
