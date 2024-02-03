CREATE TABLE IF NOT EXISTS "auth_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"api_key" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"hashed_password" text NOT NULL,
	"two_factor_secret" text,
	"role" text DEFAULT 'USER',
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "circuits" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"used_titles" text[],
	"wikipedia_page_id" integer,
	"locality" text,
	"country" text,
	"timezone" text,
	"utc_offset" integer,
	"lon" real,
	"lat" real,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL,
	CONSTRAINT "circuits_title_unique" UNIQUE("title"),
	CONSTRAINT "circuits_wikipedia_page_id_unique" UNIQUE("wikipedia_page_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rounds" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"season" text NOT NULL,
	"link" text,
	"start" timestamp,
	"end" timestamp,
	"circuit_id" integer NOT NULL,
	"series" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"round_id" text NOT NULL,
	"type" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weather" (
	"id" serial PRIMARY KEY NOT NULL,
	"temp" real NOT NULL,
	"weather_id" integer NOT NULL,
	"dt" timestamp NOT NULL,
	"circuit_id" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_keys" ADD CONSTRAINT "auth_keys_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
