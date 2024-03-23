import type { circuits } from "astro:db";

export type Circuit = typeof circuits.$inferSelect;
export type NewCircuit = Pick<typeof circuits.$inferInsert, "id" | "wikipediaPageId"> & {
	oldTitle: string;
	wikipediaTitle: string;
	coordinates?: {
		lon: number;
		lat: number;
	};
};
export type NewCreatedCircuit = Omit<typeof circuits.$inferInsert, "updatedAt"> &
	Pick<NewCircuit, "oldTitle"> &
	Pick<Circuit, "id">;
