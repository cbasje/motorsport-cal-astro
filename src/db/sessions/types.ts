import type { sessions } from "./schema";

export const sessionTypes = ["R", "S", "SQ", "Q", "FP", "T", "TBC"] as const;
export type SessionType = (typeof sessionTypes)[number];

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert & Pick<Session, "id">;
