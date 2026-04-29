CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"batch" text NOT NULL,
	"github_url" text,
	"image_url" text NOT NULL,
	"image_file_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_team_members_display_order" ON "team_members" ("display_order");
