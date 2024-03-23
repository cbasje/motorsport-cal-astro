import { LoginSchema } from "$db/auth/types";
import { lucia } from "$lib/server/auth";
import { CustomError, debugRes } from "$lib/utils/response";
import type { APIRoute } from "astro";
import { authUsers, db, eq } from "astro:db";
import { generateId } from "lucia";
import * as v from "valibot";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	try {
		const formData = await request.formData();
		const { username, password } = v.parse(LoginSchema, {
			username: formData.get("username"),
			password: formData.get("password"),
		});

		// Check if username is already used
		const [existingUser] = await db
			.select()
			.from(authUsers)
			.where(eq(authUsers.username, username.toLowerCase()))
			.limit(1);
		if (existingUser) throw new CustomError("Username is already in use", 403);

		const userId = generateId(15);
		const hashedPassword = await Bun.password.hash(password);

		await db.insert(authUsers).values({
			id: userId,
			username,
			hashedPassword,
			updatedAt: new Date(),
		});

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		return redirect("/");
	} catch (error_) {
		return debugRes(error_, "🔒");
	}
};
