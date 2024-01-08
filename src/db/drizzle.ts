import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import postgres from "pg";

export const connectionString = process.env.DATABASE_URL ?? "";

// Disable prefetch as it is not supported for "Transaction" pool mode
export const pool = new postgres.Pool({
	connectionString
});
export const db = drizzle(pool);

// This will run migrations on the database, skipping the ones already applied for migrations
const migrationPool = new postgres.Pool({
	connectionString,
	max: 1
});
migrate(drizzle(migrationPool), { migrationsFolder: "./drizzle/migrations" });
