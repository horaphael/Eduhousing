CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE "user_role" AS ENUM (
  'student',
  'owner',
  'admin'
);

CREATE TYPE "housing_type" AS ENUM (
  'studio',
  't1',
  't2',
  't3_plus',
  'shared_room'
);

CREATE TYPE "handover_type" AS ENUM (
  'lease_transfer',
  'sublet',
  'new_lease'
);

CREATE TYPE "listing_status" AS ENUM (
  'draft',
  'published',
  'rented',
  'archived'
);

CREATE TYPE "dpe_grade" AS ENUM (
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" citext UNIQUE NOT NULL,
  "password_hash" text NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "role" user_role NOT NULL DEFAULT 'student',
  "avatar_url" text,
  "bio" text,
  "email_verified_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  "deleted_at" timestamptz
);

CREATE TABLE "listings" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "author_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "housing_type" housing_type NOT NULL,
  "furnished" boolean NOT NULL DEFAULT false,
  "rent_cents" integer NOT NULL CHECK (rent_cents >= 0),
  "charges_cents" integer NOT NULL CHECK (charges_cents >= 0) DEFAULT 0,
  "deposit_cents" integer NOT NULL CHECK (deposit_cents >= 0) DEFAULT 0,
  "surface_m2" numeric(5,1) CHECK (surface_m2 > 0),
  "address_line" text NOT NULL,
  "city" text NOT NULL,
  "postal_code" text NOT NULL,
  "available_from" date NOT NULL,
  "available_until" date,
  "dpe_grade" dpe_grade,
  "published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "listings_dates_order" CHECK (available_until IS NULL OR available_until > available_from),
  CONSTRAINT "listings_dpe_not_g" CHECK (dpe_grade IS NULL OR dpe_grade <> 'G')
);

CREATE TABLE "listing_photos" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "listing_id" uuid NOT NULL,
  "url" text NOT NULL,
  "thumbnail_url" text,
  "position" smallint NOT NULL DEFAULT 0,
  "size_bytes" integer,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "conversations" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "listing_id" uuid NOT NULL,
  "initiator_id" uuid NOT NULL,
  "recipient_id" uuid NOT NULL,
  "last_message_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "conversations_distinct_parties" CHECK (initiator_id <> recipient_id)
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "conversation_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "body" text NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  "read_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX "idx_users_active" ON "users" ("created_at");

CREATE INDEX "idx_listings_author" ON "listings" ("author_id");

CREATE INDEX "idx_listings_search" ON "listings" ("city", "rent_cents", "available_from");

CREATE INDEX "idx_listings_recent" ON "listings" ("published_at");

CREATE UNIQUE INDEX ON "listing_photos" ("listing_id", "position");

CREATE INDEX "idx_listing_photos_listing" ON "listing_photos" ("listing_id", "position");

CREATE UNIQUE INDEX ON "conversations" ("listing_id", "initiator_id", "recipient_id");

CREATE INDEX "idx_conversations_initiator" ON "conversations" ("initiator_id", "last_message_at");

CREATE INDEX "idx_conversations_recipient" ON "conversations" ("recipient_id", "last_message_at");

CREATE INDEX "idx_messages_conversation" ON "messages" ("conversation_id", "created_at");

CREATE INDEX "idx_messages_unread" ON "messages" ("conversation_id");

ALTER TABLE "listings" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "listing_photos" ADD FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversations" ADD FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversations" ADD FOREIGN KEY ("initiator_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "conversations" ADD FOREIGN KEY ("recipient_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;
