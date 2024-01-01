import { db } from "$db/drizzle";
import { circuits } from "./schema";
import { eq } from "drizzle-orm";

// FIXME: log!

export const getOne = async (id: number) => {
	const [first] = await db
		.select()
		.from(circuits)
		.where(eq(circuits.id, id))
		.limit(1);
	return first;
};

export const getAll = async () => {
	return await db.select().from(circuits);
};

export const getMapMarkers = async () => {
	return await db
		.select({
			lat: circuits.lat,
			lon: circuits.lon,
			title: circuits.title,
		})
		.from(circuits);
};
