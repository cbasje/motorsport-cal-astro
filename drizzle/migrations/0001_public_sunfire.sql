ALTER TABLE "auth_keys" DROP CONSTRAINT "auth_keys_user_id_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "auth_session" DROP CONSTRAINT "auth_session_user_id_auth_user_id_fk";
--> statement-breakpoint
ALTER TABLE "rounds" DROP CONSTRAINT "rounds_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_round_id_rounds_id_fk";
--> statement-breakpoint
ALTER TABLE "weather" DROP CONSTRAINT "weather_circuit_id_circuits_id_fk";
--> statement-breakpoint
ALTER TABLE "rounds" ALTER COLUMN "start" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "rounds" ALTER COLUMN "end" SET DATA TYPE date;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_keys" ADD CONSTRAINT "auth_keys_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth_user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rounds" ADD CONSTRAINT "rounds_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "circuits"("id") ON DELETE set null ON UPDATE set null;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "weather" ADD CONSTRAINT "weather_circuit_id_circuits_id_fk" FOREIGN KEY ("circuit_id") REFERENCES "circuits"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
