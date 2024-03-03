import type { circuits } from "./schema";

export type Circuit = typeof circuits.$inferSelect;
export type NewCircuit = Pick<typeof circuits.$inferInsert, "id" | "wikipediaPageId"> & {
	oldTitle: string;
	wikipediaTitle: string;
	coordinates?: {
		lon: number;
		lat: number;
	};
};
export type NewCreatedCircuit = typeof circuits.$inferInsert &
	Pick<NewCircuit, "oldTitle"> &
	Pick<Circuit, "id">;
