ALTER TABLE "books" RENAME COLUMN "pages" TO "total_pages";--> statement-breakpoint
ALTER TABLE "books" RENAME COLUMN "year" TO "publication_year";--> statement-breakpoint
ALTER TABLE "books" RENAME COLUMN "stock" TO "total_copies";--> statement-breakpoint
ALTER TABLE "loans" RENAME COLUMN "return_date" TO "due_date";--> statement-breakpoint
ALTER TABLE "loans" DROP CONSTRAINT "loans_book_id_books_id_fk";
--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "loan_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "loan_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "loans" ALTER COLUMN "loan_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "cover_image_url" varchar(255);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "available_copies" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "librarian_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_librarian_id_users_id_fk" FOREIGN KEY ("librarian_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;