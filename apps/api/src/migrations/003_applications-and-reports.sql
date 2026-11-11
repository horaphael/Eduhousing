-- Migration 003: Add applications and reports tables
-- Applications: Dev J (F11, F12)
-- Reports: Dev L (F14, F15)

CREATE TYPE "application_status" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
CREATE TYPE "report_status" AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE "report_reason" AS ENUM ('fake', 'inappropriate', 'duplicate', 'scam', 'other');

-- F11/F12: Candidatures
CREATE TABLE "applications" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "listing_id" uuid NOT NULL,
  "applicant_id" uuid NOT NULL,
  "message" text,
  "status" application_status NOT NULL DEFAULT 'pending',
  "responded_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "applications_unique" UNIQUE ("listing_id", "applicant_id")
);

ALTER TABLE "applications" ADD FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE CASCADE;
ALTER TABLE "applications" ADD FOREIGN KEY ("applicant_id") REFERENCES "users" ("id") ON DELETE CASCADE;

CREATE INDEX "idx_applications_listing" ON "applications" ("listing_id", "status");
CREATE INDEX "idx_applications_applicant" ON "applications" ("applicant_id", "created_at");

-- F14/F15: Signalements
CREATE TABLE "reports" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "listing_id" uuid NOT NULL,
  "reporter_id" uuid NOT NULL,
  "reason" report_reason NOT NULL,
  "description" text,
  "status" report_status NOT NULL DEFAULT 'pending',
  "admin_id" uuid,
  "resolved_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "reports_unique" UNIQUE ("listing_id", "reporter_id")
);

ALTER TABLE "reports" ADD FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE CASCADE;
ALTER TABLE "reports" ADD FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") ON DELETE CASCADE;
ALTER TABLE "reports" ADD FOREIGN KEY ("admin_id") REFERENCES "users" ("id");

CREATE INDEX "idx_reports_status" ON "reports" ("status", "created_at");
CREATE INDEX "idx_reports_listing" ON "reports" ("listing_id");
