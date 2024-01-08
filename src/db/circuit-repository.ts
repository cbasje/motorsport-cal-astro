import { db } from "$db/drizzle";
import { and, eq, ilike, sql } from "drizzle-orm";
import { circuits, rounds } from "./schema";
import type { SeriesId } from "./types";

// FIXME: log!

export const getOne = async (id: number) => {
	const [first] = await db.select().from(circuits).where(eq(circuits.id, id)).limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(circuits);
};

export const getMapMarkers = async () => {
	return await db
		.select({
			lat: circuits.lat,
			lon: circuits.lon,
			title: circuits.title,
			series: sql<SeriesId[]>`${db
				.select({ series: sql`json_agg(${rounds.series})` })
				.from(rounds)
				.where(
					and(
						eq(rounds.circuitId, circuits.id),
						ilike(rounds.season, `%${new Date().getFullYear().toString()}%`)
					)
				)}`.as("series")
		})
		.from(circuits);
};
