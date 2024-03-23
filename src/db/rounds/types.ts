import type { Circuit } from "$db/circuits/types";
import type { CalendarDate } from "@internationalized/date";
import type { rounds } from "astro:db";

export const seriesIds = ["F1", "F2", "F3", "FE", "INDY", "NXT", "WEC", "WRC", "F1A"] as const;
export type SeriesId = (typeof seriesIds)[number];

export type Round = typeof rounds.$inferSelect;
export type NewRound = Omit<typeof rounds.$inferInsert, "circuitId" | "updatedAt"> & {
	circuitId?: Circuit["id"];
	circuitTitle: string;
} & Pick<Round, "id">;
export type NewRoundZoned = Omit<NewRound, "start" | "end"> & {
	start: CalendarDate | null;
	end: CalendarDate | null;
};
