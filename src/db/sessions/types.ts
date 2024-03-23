import type { ZonedDateTime } from "@internationalized/date";
import type { sessions } from "astro:db";

export const sessionTypes = ["R", "S", "SQ", "Q", "FP", "T", "TBC", "W"] as const;
export type SessionType = (typeof sessionTypes)[number];

export type Session = typeof sessions.$inferSelect;
export type NewSession = Omit<typeof sessions.$inferInsert, "updatedAt"> & Pick<Session, "id">;
export type NewSessionZoned = Omit<NewSession, "start" | "end"> & {
	start: ZonedDateTime;
	end: ZonedDateTime;
};
