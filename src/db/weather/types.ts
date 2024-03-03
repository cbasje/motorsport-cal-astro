import type { weather } from "./schema";

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;
