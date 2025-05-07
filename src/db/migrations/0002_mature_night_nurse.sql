ALTER TABLE "books" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp;