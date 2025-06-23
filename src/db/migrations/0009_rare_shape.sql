ALTER TABLE "loans" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "deleted_at" timestamp;