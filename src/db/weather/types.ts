import type { weather } from "astro:db";

export type Weather = typeof weather.$inferSelect;
export type NewWeather = typeof weather.$inferInsert;
