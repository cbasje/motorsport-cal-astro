import { rounds } from "$db/rounds/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { column, defineTable } from "astro:db";

export const sessions = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		number: column.number({ default: 0 }),
		start: column.date(),
		end: column.date(),
		roundId: column.text({ references: () => rounds.columns.id }),
		type: column.text({ optional: true }),
		createdAt,
		updatedAt,
	},
});
