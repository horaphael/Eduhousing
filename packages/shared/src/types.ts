// ── Enums ──

export type UserRole = "student" | "owner" | "admin";
export type HousingType = "studio" | "t1" | "t2" | "t3_plus" | "shared_room";
export type HandoverType = "lease_transfer" | "sublet" | "new_lease";
export type ListingStatus = "draft" | "published" | "rented" | "archived";
export type DpeGrade = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type ReportStatus = "pending" | "reviewed" | "dismissed";
export type ReportReason = "fake" | "inappropriate" | "duplicate" | "scam" | "other";

// ── Tables ──

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Listing {
  id: string;
  author_id: string;
  title: string;
  description: string;
  housing_type: HousingType;
  furnished: boolean;
  rent_cents: number;
  charges_cents: number;
  deposit_cents: number;
  surface_m2: number | null;
  address_line: string;
  city: string;
  postal_code: string;
  available_from: string;
  available_until: string | null;
  status: ListingStatus;
  dpe_grade: DpeGrade | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  url: string;
  thumbnail_url: string | null;
  position: number;
  size_bytes: number | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  initiator_id: string;
  recipient_id: string;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

// ── New tables (Dev J + Dev L) ──

export interface Application {
  id: string;
  listing_id: string;
  applicant_id: string;
  message: string | null;
  status: ApplicationStatus;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
}
