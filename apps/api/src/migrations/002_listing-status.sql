-- Up Migration

ALTER TABLE "listings"
  ADD COLUMN "status" listing_status NOT NULL DEFAULT 'draft';

UPDATE "listings"
  SET "status" = 'published'
  WHERE "published_at" IS NOT NULL;

CREATE INDEX "idx_listings_status_published" ON "listings" ("status", "published_at");

-- Down Migration

DROP INDEX IF EXISTS "idx_listings_status_published";

ALTER TABLE "listings" DROP COLUMN IF EXISTS "status";
