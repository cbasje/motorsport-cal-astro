import type { authKeys, authSessions, authUsers } from "./schema";

export const roles = ["ADMIN", "USER"] as const;
export type Role = (typeof roles)[number];

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type AuthKey = typeof authKeys.$inferSelect;
