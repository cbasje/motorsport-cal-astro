import { circuits } from "$db/circuits/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { column, defineTable } from "astro:db";

export const weather = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		temp: column.number(),
		weatherId: column.number(),
		dt: column.date(),
		circuitId: column.number({ references: () => circuits.columns.id }),
		createdAt,
		updatedAt,
	},
});
