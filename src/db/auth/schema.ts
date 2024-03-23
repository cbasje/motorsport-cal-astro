import { createdAt, updatedAt } from "$db/timestamp-columns";
import { column, defineTable } from "astro:db";

export const authUsers = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		username: column.text(),
		email: column.text({ optional: true }),
		hashedPassword: column.text(),
		twoFactorSecret: column.text({ optional: true }),
		role: column.text({ default: "USER" }), // Role
		createdAt,
		updatedAt,
	},
});

export const authSessions = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		userId: column.text({ references: () => authUsers.columns.id }),
		expiresAt: column.date(),
	},
});

// Table for the API keys
export const authKeys = defineTable({
	columns: {
		apiKey: column.text({ primaryKey: true }),
		userId: column.text({ references: () => authUsers.columns.id }),
		role: column.text({ optional: true }), // Role
		series: column.json({ optional: true }), // SeriesId[]
		expiresAt: column.date(),
		createdAt,
		updatedAt,
	},
});
