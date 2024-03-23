import { createdAt, updatedAt } from "$db/timestamp-columns";
import { column, defineTable } from "astro:db";

export const circuits = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		title: column.text({ unique: true }),
		usedTitles: column.json(), // string[]
		wikipediaPageId: column.number({ unique: true }),
		locality: column.text({ optional: true }),
		country: column.text({ optional: true }),
		timezone: column.text({ optional: true }),
		utcOffset: column.number({ optional: true }),
		lon: column.number({ optional: true }),
		lat: column.number({ optional: true }),
		createdAt,
		updatedAt,
	},
});
