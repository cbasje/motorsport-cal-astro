CREATE TABLE IF NOT EXISTS "circuits" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"wikipedia_page_id" integer,
	"locality" text,
	"country" text,
	"timezone" text,
	"utc_offset" integer,
	"lon" real,
	"lat" real,
	CONSTRAINT "circuits_title_unique" UNIQUE("title"),
	CONSTRAINT "circuits_wikipedia_page_id_unique" UNIQUE("wikipedia_page_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"title" text NOT NULL,
	"season" text NOT NULL,
	"link" text,
	"start" timestamp,
	"end" timestamp,
	"circuit_id" integer NOT NULL,
	"series" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" integer DEFAULT 0 NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"round_id" integer NOT NULL,
	"type" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weather" (
	"id" serial PRIMARY KEY NOT NULL,
	"temp" real NOT NULL,
	"weather_id" integer NOT NULL,
	"dt" timestamp NOT NULL,
	"circuit_id" integer NOT NULL
);
