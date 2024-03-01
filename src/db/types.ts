import type {
	authKeys,
	authSessions,
	authUsers,
	circuits,
	rounds,
	sessions,
	weather,
} from "./schema";

export const roles = ["ADMIN", "USER"] as const;
export type Role = (typeof roles)[number];

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthKey = typeof authKeys.$inferSelect;

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

export const seriesIds = ["F1", "F2", "F3", "FE", "INDY", "WEC", "WRC", "F1A"] as const;
export type SeriesId = (typeof seriesIds)[number];

export type Round = typeof rounds.$inferSelect;
export type NewRound = Omit<typeof rounds.$inferInsert, "circuitId"> & {
	circuitId?: Circuit["id"];
	circuitTitle: string;
} & Pick<Round, "id">;

export const sessionTypes = ["R", "S", "SQ", "Q", "FP", "T", "TBC"] as const;
export type SessionType = (typeof sessionTypes)[number];

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert & Pick<Session, "id">;

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;
