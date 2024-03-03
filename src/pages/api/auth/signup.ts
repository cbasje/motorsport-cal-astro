import { authUsers } from "$db/auth/schema";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { CustomError, debugRes } from "$lib/utils/response";
import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import * as v from "valibot";

const LoginSchema = v.object({
	username: v.string([
		v.minLength(3, "Please enter your email."),
		v.maxLength(31),
		v.regex(/^[a-z0-9_-]+$/, "The username is badly formatted."),
	]),
	password: v.string([
		v.minLength(1, "Please enter your password."),
		v.minLength(6, "Your password must have 6 characters or more."),
		v.maxLength(255),
	]),
});

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
