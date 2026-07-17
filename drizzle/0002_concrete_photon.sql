-- Convert sector column to text temporarily to allow updating old values
ALTER TABLE "users" ALTER COLUMN "sector" SET DATA TYPE text;--> statement-breakpoint

-- Update any remaining rows that still use the old sector value
UPDATE "users" SET "sector" = 'ekonomi' WHERE "sector" = 'pengusaha';--> statement-breakpoint

-- Ensure the sector enum only contains the current valid values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'sector' AND n.nspname = 'public'
  ) THEN
    DROP TYPE "public"."sector";
  END IF;
END $$;--> statement-breakpoint

CREATE TYPE "public"."sector" AS ENUM('pendidikan', 'ekonomi', 'profesional');--> statement-breakpoint

-- Cast the column back to the enum
ALTER TABLE "users" ALTER COLUMN "sector" SET DATA TYPE "public"."sector" USING "sector"::"public"."sector";
