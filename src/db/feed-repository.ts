import { db } from "$db/drizzle";
import { eq } from "drizzle-orm";
import { circuits, rounds, sessions } from "./schema";

// FIXME: log!

export const getAllSessions = async () => {
	return await db
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
};
