import { rounds } from "$db/rounds/schema";
import { db } from "$lib/server/db";
import { eq, ilike, sql } from "drizzle-orm";
import { circuits } from "./schema";

// FIXME: log!

export const getOne = async (id: number) => {
	const [first] = await db.select().from(circuits).where(eq(circuits.id, id)).limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(circuits);
};

export const getMapMarkers = async () => {
	const sq = db.$with("sq").as(
		db
			.select({
				firstRound:
					sql<string>`(array_agg(${rounds.id} ORDER BY ${rounds.start} ASC))[1]`.as(
						"firstRound"
					),
				start: sql<Date>`(array_agg(${rounds.id} ORDER BY ${rounds.start} ASC))[1]`.as(
					"start"
				),
				series: sql<Date>`array_agg(${rounds.series} ORDER BY ${rounds.start} ASC)`.as(
					"series"
				),
				circuitId: rounds.circuitId,
				count: sql<number>`count(*)::int`.as("count"),
			})
			.from(rounds)
			.where(ilike(rounds.season, `%${new Date().getFullYear().toString()}%`))
			.groupBy(rounds.circuitId)
	);
	return await db
		.with(sq)
		.select({
			firstRound: sq.firstRound,
			title: circuits.title,
			series: sq.series,
			lat: circuits.lat,
			lon: circuits.lon,
		})
		.from(circuits)
		.leftJoin(sq, eq(sq.circuitId, circuits.id));
};
