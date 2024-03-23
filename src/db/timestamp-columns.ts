import { NOW, column } from "astro:db";

export const createdAt = column.date({
	default: NOW,
	mode: "date",
	optional: true,
});
export const updatedAt = column.date();
