import { generateRoundId, generateSessionId } from "$lib/utils/id";
import { authKeys, authUsers, circuits, db, rounds, sessions } from "astro:db";
import { generateId } from "lucia";

// https://astro.build/db/seed
export default async function seed() {
	const userId = generateId(15);
	const hashedPassword = await Bun.password.hash("sebassebas");

	await db
		.insert(authUsers)
		.values({ id: userId, username: "sebas", hashedPassword, updatedAt: new Date() })
		.returning();

	await db.insert(authKeys).values([
		{
			apiKey: "8awutyh3crnbg11",
			userId,
			updatedAt: new Date(),
			role: "USER",
			expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60),
		},
	]);

	const [c] = await db
		.insert(circuits)
		.values([
			{
				title: "TestCircuit",
				usedTitles: ["TestCircuit"],
				wikipediaPageId: 0,
				updatedAt: new Date(),
			},
		])
		.returning();
	const [r] = await db
		.insert(rounds)
		.values([
			{
				id: generateRoundId("F1", "2024", 0, "TestRound"),
				series: "F1",
				title: "TestRound",
				season: "2024",
				start: new Date(),
				end: new Date(),
				circuitId: c.id,
				updatedAt: new Date(),
			},
		])
		.returning();
	await db.insert(sessions).values([
		{
			id: generateSessionId(r.id, "R", 0),
			type: "R",
			start: new Date(),
			end: new Date(),
			roundId: r.id,
			updatedAt: new Date(),
		},
	]);
}
