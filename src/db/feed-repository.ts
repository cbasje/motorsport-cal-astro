import { db } from "$db/drizzle";
import { eq, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import { circuits, rounds, sessions } from "./schema";
import type { SessionType } from "./types";

// FIXME: log!

export const getAllSessions = async () => {
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
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id));

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
		.leftJoin(circuits, eq(rounds.circuitId, circuits.id));

	return await union(allEmptyRounds, allSessions);
};
