// FIXME: log!

import type { SeriesId } from "$db/rounds/types";
import { circuits, count, db, eq, like, rounds, sql } from "astro:db";

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
				firstRound: sql<
					string[]
				>`json_extract(json_group_array(${rounds.id} ORDER BY ${rounds.start} ASC), '$[0]')`.as(
					"firstRound"
				),
				start: sql<
					Date[]
				>`json_extract(json_group_array(${rounds.id} ORDER BY ${rounds.start} ASC), '$[0]')`.as(
					"start"
				),
				series: sql<
					SeriesId[]
				>`json_group_array(${rounds.series} ORDER BY ${rounds.start} ASC)`.as("series"),
				circuitId: rounds.circuitId,
				count: count().as("count"),
			})
			.from(rounds)
			.where(like(rounds.season, `%${new Date().getFullYear().toString()}%`))
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
			count: sq.count,
		})
		.from(circuits)
		.leftJoin(sq, eq(sq.circuitId, circuits.id));
};
