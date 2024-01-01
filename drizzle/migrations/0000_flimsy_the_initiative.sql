CREATE TABLE `circuits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`wikipedia_page_id` integer,
	`locality` text,
	`country` text,
	`timezone` text,
	`utc_offset` integer,
	`lon` real,
	`lat` real
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer DEFAULT 0 NOT NULL,
	`title` text NOT NULL,
	`season` text NOT NULL,
	`link` text,
	`start` integer,
	`end` integer,
	`circuit_id` integer NOT NULL,
	`series` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer DEFAULT 0 NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`round_id` integer NOT NULL,
	`type` text
);
--> statement-breakpoint
CREATE TABLE `weather` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`temp` real NOT NULL,
	`weather_id` integer NOT NULL,
	`dt` integer NOT NULL,
	`circuit_id` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `circuits_title_unique` ON `circuits` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `circuits_wikipedia_page_id_unique` ON `circuits` (`wikipedia_page_id`);