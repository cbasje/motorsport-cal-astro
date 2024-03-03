import { circuits } from "$db/circuits/schema";
import { rounds } from "$db/rounds/schema";
import { seriesIds, type NewRound, type Round } from "$db/rounds/types";
import { sessions } from "$db/sessions/schema";
import { sessionTypes, type NewSession } from "$db/sessions/types";
import { generateRoundId, generateSessionId } from "$lib/utils/id";
import { fakerEN } from "@faker-js/faker";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { exit } from "node:process";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const pickRandom = <T extends Readonly<any[]>>(input: T): T[number] => {
	const rnd = Math.round(Math.random() * (input.length - 1));
	return input.at(rnd) ?? "F1";
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
			updatedAt: new Date(),
			// TODO; utcOffset
		})
		.returning({ id: circuits.id });
	return result.id;
}

async function createRounds(circuitId: number) {
	console.log("Creating round...");

	const updatedAt = new Date();
	const newRounds = [];
	for (let i = 0; i < 2; i++) {
		const title = fakerEN.company.name() + " Grand Prix";
		const start = fakerEN.date.future();
		const end = fakerEN.date.soon({ refDate: start });

		const series = pickRandom(seriesIds);
		newRounds.push({
			id: generateRoundId(series, start.getFullYear().toString(), i, title),
			circuitTitle: "",
			number: i,
			title,
			season: start.getFullYear().toString(),
			circuitId,
			series,
			start,
			end,
			updatedAt,
		} satisfies NewRound);
	}

	return await db
		.insert(rounds)
		.values(newRounds)
		.returning({ id: rounds.id, start: rounds.start });
}

async function createSessions(rounds: Pick<Round, "id" | "start">[]) {
	console.log("Creating sessions...");

	const updatedAt = new Date();
	const newSessions = [];
	for (const r of rounds) {
		for (const [i, type] of sessionTypes.entries()) {
			const start = fakerEN.date.soon({ refDate: r.start ?? undefined });
			const end = fakerEN.date.soon({ refDate: r.start ?? undefined });

			newSessions.push({
				id: generateSessionId(r.id, type, i),
				number: i,
				start,
				end,
				roundId: r.id,
				type,
				updatedAt,
			} satisfies NewSession);
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
