ALTER TABLE "users" ALTER COLUMN "sector" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."sector";--> statement-breakpoint
CREATE TYPE "public"."sector" AS ENUM('pendidikan', 'ekonomi', 'profesional');--> statement-breakpoint
UPDATE "users" SET "sector" = 'ekonomi' WHERE "sector" = 'pengusaha';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "sector" SET DATA TYPE "public"."sector" USING "sector"::"public"."sector";