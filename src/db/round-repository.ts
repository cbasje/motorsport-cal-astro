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

export const getWeekends = async (input: {
	startOffset: number | undefined;
	endOffset: number | undefined;
}) => {
	const schema = z.object({
		startOffset: z.number().int().min(-52).max(52).default(0),
		endOffset: z.number().int().min(-52).max(52).default(0),
	});

	const [start, end] = getWeekendDates(input.startOffset, input.endOffset);
	return await db
		.select({
			id: rounds.id,
			title: rounds.title,
			series: rounds.series,
			start: rounds.start,
			end: rounds.end,
			country: circuits.country,
			locality: circuits.locality,
			circuitTitle: circuits.title,
		})
		.from(rounds)
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id))
		.where(and(gte(rounds.start, start), lte(rounds.end, end)))
		.orderBy(asc(rounds.series));
};
