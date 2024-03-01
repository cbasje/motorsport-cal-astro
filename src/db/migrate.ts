import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

// This will run migrations on the database, skipping the ones already applied
// for migrations
const sql = neon(process.env.DATABASE_URL!);
migrate(drizzle(sql), { migrationsFolder: "./drizzle/migrations" });
