import { circuits } from "$db/circuits/schema";
import { createdAt, updatedAt } from "$db/timestamp-columns";
import { column, defineTable } from "astro:db";

export const rounds = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		number: column.number({ default: 0 }),
		title: column.text(),
		season: column.text(),
		link: column.text({ optional: true }),
		start: column.date({ optional: true }),
		end: column.date({ optional: true }),
		circuitId: column.number({ references: () => circuits.columns.id }),
		series: column.text(), // SeriesId
		createdAt,
		updatedAt,
	},
});
