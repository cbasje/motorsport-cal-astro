import { db } from "$db/drizzle";
import { getWeekendDatesFromOffset, getWeekendOffsetFromDates } from "$lib/utils/date";
import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { groupBy } from "lodash";
import { z } from "zod";
import { circuits, rounds, sessions } from "./schema";

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
			id: rounds.id,
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

	const [start, end] = getWeekendDatesFromOffset(input.startOffset, input.endOffset);

	const allRounds = await db
		.with(sessionSq)
		.select({
			id: rounds.id,
			title: rounds.title,
			series: rounds.series,
			start: rounds.start,
			end: rounds.end,
			year: sql<number>`DATE_PART('year', ${rounds.start})`,
			weekNumber: sql<number>`DATE_PART('week', ${rounds.start})`,
			weekendOffset: sql<number>`DATE_PART('week', ${rounds.start}) - DATE_PART('week', NOW())`,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
			sessionCount: sessionSq.count,
			isTest: inArray(
				rounds.id,
				db
					.select({ id: sessions.id })
					.from(sessions)
					.where(and(eq(sessions.type, "T"), eq(rounds.id, sessions.roundId)))
			),
		})
		.from(rounds)
		.leftJoin(sessionSq, eq(sessionSq.roundId, rounds.id))
		.leftJoin(circuits, eq(circuits.id, rounds.circuitId))
		.where(and(gte(rounds.start, start), lte(rounds.end, end)))
		.orderBy(asc(rounds.start), asc(rounds.series));
	// <!-- FIXME: Real week -->
	return groupBy(allRounds, (r) => r.weekendOffset);
};
