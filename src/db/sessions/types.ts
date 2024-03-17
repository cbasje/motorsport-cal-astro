import type { ZonedDateTime } from "@internationalized/date";
import type { sessions } from "./schema";

export const sessionTypes = ["R", "S", "SQ", "Q", "FP", "T", "TBC", "W"] as const;
export type SessionType = (typeof sessionTypes)[number];

export type Session = typeof sessions.$inferSelect;
export type NewSession = Omit<typeof sessions.$inferInsert, "updatedAt"> & Pick<Session, "id">;
export type NewSessionZoned = Omit<typeof sessions.$inferInsert, "start" | "end" | "updatedAt"> &
	Pick<Session, "id"> & {
		start: ZonedDateTime;
		end: ZonedDateTime;
	};
