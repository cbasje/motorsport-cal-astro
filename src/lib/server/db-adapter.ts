import type { AuthSession, AuthUser } from "$db/auth/types";
import type { SqliteDB, Table } from "@astrojs/db/runtime";
import { authSessions, authUsers, db, eq, lte } from "astro:db";
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

export class AstroDbAdapter implements Adapter {
	private db: SqliteDB;
	private sessionTable: Table;
	private userTable: Table;
	constructor() {
		this.db = db;
		this.sessionTable = authSessions;
		this.userTable = authUsers;
	}
	async deleteSession(sessionId: string): Promise<void> {
		await this.db.delete(this.sessionTable).where(eq(this.sessionTable.id, sessionId));
	}
	async deleteUserSessions(userId: string): Promise<void> {
		await this.db.delete(this.sessionTable).where(eq(this.sessionTable.userId, userId));
	}
	async getSessionAndUser(
		sessionId: string
	): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
		const [databaseSession, databaseUser] = await Promise.all([
			this.getSession(sessionId),
			this.getUserFromSessionId(sessionId),
		]);
		return [databaseSession, databaseUser];
	}
	async getUserSessions(userId: string): Promise<DatabaseSession[]> {
		const result = await this.db
			.select()
			.from(this.sessionTable)
			.where(eq(this.sessionTable.userId, userId))
			.all();
		return result.map((val) => {
			return transformIntoDatabaseSession(val);
		});
	}
	async setSession(session: DatabaseSession): Promise<void> {
		await this.db
			.insert(this.sessionTable)
			.values({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				...session.attributes,
			})
			.run();
	}
	async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
		await this.db
			.update(this.sessionTable)
			.set({
				expiresAt,
			})
			.where(eq(this.sessionTable.id, sessionId))
			.run();
	}
	async deleteExpiredSessions(): Promise<void> {
		await this.db.delete(this.sessionTable).where(lte(this.sessionTable.expiresAt, new Date()));
	}
	async getSession(sessionId: string) {
		const result = await this.db
			.select()
			.from(this.sessionTable)
			.where(eq(this.sessionTable.id, sessionId))
			.get();
		if (!result) return null;
		return transformIntoDatabaseSession(result);
	}
	async getUserFromSessionId(sessionId: string) {
		const { _, $inferInsert, $inferSelect, getSQL, ...userColumns } = this.userTable;
		const result = await this.db
			.select(userColumns)
			.from(this.sessionTable)
			.innerJoin(this.userTable, eq(this.sessionTable.userId, this.userTable.id))
			.where(eq(this.sessionTable.id, sessionId))
			.get();
		if (!result) return null;
		return transformIntoDatabaseUser(result);
	}
}
function transformIntoDatabaseSession(raw: AuthSession) {
	const { id, userId, expiresAt, ...attributes } = raw;
	return {
		userId,
		id,
		expiresAt,
		attributes,
	};
}
function transformIntoDatabaseUser(raw: AuthUser) {
	const { id, ...attributes } = raw;
	return {
		id,
		attributes,
	};
}
