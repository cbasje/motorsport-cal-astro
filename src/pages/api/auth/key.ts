import { db } from "$db/drizzle";
import { authKeys } from "$db/schema";
import { seriesIds } from "$db/types";
import { debugRes, successRes } from "$lib/utils/response";
import type { APIRoute } from "astro";
import { generateId } from "lucia";
import * as v from "valibot";

const CreateKeySchema = v.object({
	userId: v.string([v.length(15, "Unrecognized user id")]),
});

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData();
		const { userId } = v.parse(CreateKeySchema, {
			userId: formData.get("user_id"),
		});

		const apiKey = generateId(15);

		const [createdKey] = await db
			.insert(authKeys)
			.values({
				apiKey,
				userId,
				role: "USER",
				series: [...seriesIds],
				expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
				updatedAt: new Date(),
			})
			.returning();

		return successRes({ apiKey: createdKey.apiKey ?? "" });
	} catch (error_) {
		return debugRes(error_, "🔒");
	}
};
