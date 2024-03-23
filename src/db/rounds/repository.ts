import { getWeekendDatesFromOffset } from "$lib/utils/date";
import { and, asc, circuits, db, eq, gte, inArray, lte, rounds, sessions, sql } from "astro:db";
import { groupBy } from "lodash";
import * as v from "valibot";

// FIXME: log!

const sessionSq = db.$with("children").as(
	db
		.select({
			roundId: sessions.roundId,
			count: sql`count(*)`.mapWith(Number).as("count"),
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
			year: sql`strftime('%Y', ${rounds.start})`.mapWith(Number),
			weekNumber: sql`strftime('%W', ${rounds.start})`.mapWith(Number),
			weekendOffset: sql`strftime('%W', ${rounds.start}) - strftime('%W', 'now')`.mapWith(
				Number
			),
			circuitId: rounds.circuitId,
			series: rounds.series,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
			timezone: circuits.timezone,
			sessionCount: sessionSq.count,
			isTest: inArray(
				rounds.id,
				db
					.selectDistinct({ roundId: sessions.roundId })
					.from(sessions)
					.where(eq(sessions.type, "T"))
			),
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
	const schema = v.object({
		startOffset: v.number([v.minValue(-52), v.maxValue(52), v.integer()]),
		endOffset: v.number([v.minValue(-52), v.maxValue(52), v.integer()]),
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
			year: sql`strftime('%Y', ${rounds.start})`.mapWith(Number),
			weekNumber: sql`strftime('%W', ${rounds.start})`.mapWith(Number),
			weekendOffset: sql`strftime('%W', ${rounds.start}) - strftime('%W', 'now')`.mapWith(
				Number
			),
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
			sessionCount: sessionSq.count,
			isTest: inArray(
				rounds.id,
				db
					.selectDistinct({ roundId: sessions.roundId })
					.from(sessions)
					.where(eq(sessions.type, "T"))
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
