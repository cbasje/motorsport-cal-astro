import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import postgres from "pg";
import { connectionString } from "./drizzle";

// This will run migrations on the database, skipping the ones already applied for migrations
const migrationPool = new postgres.Pool({
	connectionString,
	max: 1,
});
migrate(drizzle(migrationPool), { migrationsFolder: "./drizzle/migrations" });
