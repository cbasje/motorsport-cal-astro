import { LoginSchema } from "$db/auth/types";
import { lucia } from "$lib/server/auth";
import { CustomError, debugRes } from "$lib/utils/response";
import type { APIRoute } from "astro";
import { authUsers, db, eq } from "astro:db";
import * as v from "valibot";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	try {
		const formData = await request.formData();
		const { username, password } = v.parse(LoginSchema, {
			username: formData.get("username"),
			password: formData.get("password"),
		});

		const [existingUser] = await db
			.select()
			.from(authUsers)
			.where(eq(authUsers.username, username.toLowerCase()))
			.limit(1);
		if (!existingUser) throw new CustomError("Incorrect username or password", 401);

		const isValidPassword = await Bun.password.verify(password, existingUser.hashedPassword);
		if (!isValidPassword) throw new CustomError("Incorrect username or password", 401);

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		return redirect("/");
	} catch (error_) {
		return debugRes(error_, "🔒");
	}
};
