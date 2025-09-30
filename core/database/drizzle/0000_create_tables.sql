-- Custom SQL migration file, put your code below! --
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TYPE "public"."status" AS ENUM('Draft', 'Pending', 'Processing', 'Complete');--> statement-breakpoint
CREATE TABLE "land_valuation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "status" DEFAULT 'Draft' NOT NULL,
	"file_name" varchar(1024),
	"file_size" integer,
	"column_mapping" jsonb,
	"result" jsonb,
	"raw_contents" "bytea",
	"output_contents" "bytea",
	"refined_contents" "bytea",
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"processing_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"source" varchar(50),
	"state" varchar(50),
	"county" varchar(50),
	"id" varchar(50),
	"acres" double precision,
	"lastUpdated" timestamp,
	"url" varchar(1024),
	"location" geometry(point),
	"sales_price" bigint,
	"sales_date" timestamp,
	"address_line_1" varchar(512),
	"address_city" varchar(50),
	"address_state" varchar(50),
	"address_zip" varchar(10),
	"timestamp" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires" timestamp,
	"data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deleted" timestamp,
	"profile" jsonb NOT NULL,
	"auth" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "land_valuation_requests" ADD CONSTRAINT "land_valuation_requests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_location_ids" ON "properties" USING gist ("location");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_key" ON "users" USING btree ((auth->>'username'));