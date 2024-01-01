import {
	circuits,
	rounds,
	sessions,
	type NewSession,
	seriesIds,
	sessionTypes,
} from "$db/schema";
import { fakerEN } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { exit } from "node:process";
import { Database } from "bun:sqlite";

const sqlite = new Database(process.env.DATABASE_URL);
export const db = drizzle(sqlite);

const pickRandom = <T extends Readonly<any[]>>(
	input: T
): T[number] | undefined => {
	const rnd = Math.round(Math.random() * (input.length - 1));
	return input.at(rnd);
};

async function createCircuit() {
	console.log("Creating circuit...");

	const title = fakerEN.company.name();
	const l = fakerEN.location;

	const [result] = await db
		.insert(circuits)
		.values({
			title,
			locality: l.county(),
			country: l.countryCode("alpha-2"),
			timezone: l.timeZone(),
			lat: l.latitude(),
			lon: l.longitude(),
			// TODO; utcOffset
		})
		.returning({ id: circuits.id });
	return result.id;
}

async function createRound(circuitId: number) {
	console.log("Creating round...");

	const title = fakerEN.company.name() + " Grand Prix";
	const start = fakerEN.date.soon();
	const end = fakerEN.date.soon({ refDate: start });

	const [result] = await db
		.insert(rounds)
		.values({
			number: 0,
			title,
			season: start.getFullYear().toString(),
			circuitId,
			series: pickRandom(seriesIds),
			start,
			end,
		})
		.returning({ id: rounds.id });
	return result.id;
}

async function createSessions(roundId: number) {
	console.log("Creating sessions...");

	const newSessions: Array<NewSession> = [];
	for (const [i, type] of sessionTypes.entries()) {
		const start = fakerEN.date.soon();
		const end = fakerEN.date.soon({ refDate: start });

		newSessions.push({
			number: i,
			start,
			end,
			roundId,
			type,
		});
	}

	await db.insert(sessions).values(newSessions);
}

async function main() {
	const circuitId = await createCircuit();
	const roundId = await createRound(circuitId);
	await createSessions(roundId);
}

try {
	await main();
} catch (_error) {
	if (_error instanceof Error) console.error(_error.message);
	exit(1);
}
exit(0);
