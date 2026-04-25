CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"created_by_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "exam_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"program" text DEFAULT '' NOT NULL,
	"slot" text DEFAULT '' NOT NULL,
	"date" text DEFAULT '' NOT NULL,
	"start_time" text DEFAULT '' NOT NULL,
	"end_time" text DEFAULT '' NOT NULL,
	"course_code" text DEFAULT '' NOT NULL,
	"course_title" text DEFAULT '' NOT NULL,
	"students" text DEFAULT '' NOT NULL,
	"faculty" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upload_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"uploaded_by" integer,
	"row_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"error_message" text,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_id_admin_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_history" ADD CONSTRAINT "upload_history_uploaded_by_admin_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;