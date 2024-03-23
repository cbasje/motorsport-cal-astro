import { authKeys, authSessions, authUsers } from "$db/auth/schema";
import { circuits } from "$db/circuits/schema";
import { rounds } from "$db/rounds/schema";
import { sessions } from "$db/sessions/schema";
import { weather } from "$db/weather/schema";
import { defineDb } from "astro:db";

// https://astro.build/db/config
export default defineDb({
	tables: {
		authUsers,
		authSessions,
		authKeys,
		circuits,
		rounds,
		sessions,
		weather,
	},
});
