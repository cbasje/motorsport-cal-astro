import { authKeys, authUsers, db } from "astro:db";
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
}
