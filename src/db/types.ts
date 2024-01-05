import type { circuits, rounds, sessions, weather } from "./schema";

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;

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

export type Round = typeof rounds.$inferSelect;
export type NewRound = typeof rounds.$inferInsert & { circuitTitle: string };

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
