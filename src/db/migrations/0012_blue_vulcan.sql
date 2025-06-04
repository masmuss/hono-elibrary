ALTER TABLE "loans" ALTER COLUMN "librarian_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "approved_at" timestamp;