import {
	circuits,
	rounds,
	sessions,
	type NewSession,
	seriesIds,
	sessionTypes,
	type NewRound,
	type Round,
} from "$db/schema";
import { fakerEN } from "@faker-js/faker";
import { exit } from "node:process";
import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "pg";

// Disable prefetch as it is not supported for "Transaction" pool mode
export const pool = new postgres.Pool({
	connectionString: process.env.DATABASE_URL ?? "",
});
export const db = drizzle(pool);

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

async function createRounds(circuitId: number) {
	console.log("Creating round...");

	const newRounds: Array<NewRound> = [];
	for (let i = 0; i < 2; i++) {
		const title = fakerEN.company.name() + " Grand Prix";
		const start = fakerEN.date.future();
		const end = fakerEN.date.soon({ refDate: start });

		newRounds.push({
			number: i,
			title,
			season: start.getFullYear().toString(),
			circuitId,
			series: pickRandom(seriesIds),
			start,
			end,
		});
	}

	return await db
		.insert(rounds)
		.values(newRounds)
		.returning({ id: rounds.id, start: rounds.start });
}

async function createSessions(rounds: Pick<Round, "id" | "start">[]) {
	console.log("Creating sessions...");

	const newSessions: Array<NewSession> = [];
	for (const r of rounds) {
		for (const [i, type] of sessionTypes.entries()) {
			const start = fakerEN.date.soon({ refDate: r.start ?? undefined });
			const end = fakerEN.date.soon({ refDate: r.start ?? undefined });

			newSessions.push({
				number: i,
				start,
				end,
				roundId: r.id,
				type,
			});
		}
	}

	await db.insert(sessions).values(newSessions);
}

async function main() {
	const circuitId = await createCircuit();
	const rounds = await createRounds(circuitId);
	await createSessions(rounds);
}

try {
	await main();
} catch (_error) {
	if (_error instanceof Error) console.error(_error.message);
	exit(1);
}
exit(0);
