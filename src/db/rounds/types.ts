import type { Circuit } from "$db/circuits/types";
import type { rounds } from "./schema";

export const seriesIds = ["F1", "F2", "F3", "FE", "INDY", "WEC", "WRC", "F1A"] as const;
export type SeriesId = (typeof seriesIds)[number];

export type Round = typeof rounds.$inferSelect;
export type NewRound = Omit<typeof rounds.$inferInsert, "circuitId"> & {
	circuitId?: Circuit["id"];
	circuitTitle: string;
} & Pick<Round, "id">;
