/// <reference path="../.astro/db-types.d.ts" />
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		session: import("lucia").Session | null;
		user: import("lucia").User | null;
		key: import("$db/types").AuthKey | null;
	}
}

interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly PUBLIC_MAP_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
