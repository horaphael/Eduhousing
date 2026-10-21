import type { Listing, ListingPhoto } from "@eduhousing/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type ListingWithPhotos = Listing & { photos: ListingPhoto[] };

function getUserId(): string | null {
  try {
    return localStorage.getItem("eduhousing_user_id");
  } catch {
    return null;
  }
}

function headers(needsAuth: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  const uid = getUserId();
  if (needsAuth && uid) h["x-user-id"] = uid;
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message || "Erreur inconnue";
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_URL}/health`);
  return handleResponse(res);
}

export async function fetchListings(
  city?: string,
): Promise<ListingWithPhotos[]> {
  const params = new URLSearchParams();
  if (city?.trim()) params.set("city", city.trim());
  const qs = params.toString();
  const res = await fetch(`${API_URL}/listings${qs ? `?${qs}` : ""}`);
  return handleResponse(res);
}

export async function fetchMyListings(): Promise<ListingWithPhotos[]> {
  const res = await fetch(`${API_URL}/listings/mine`, {
    headers: headers(true),
  });
  return handleResponse(res);
}

export async function fetchListing(id: string): Promise<ListingWithPhotos> {
  const res = await fetch(`${API_URL}/listings/${id}`, {
    headers: headers(true),
  });
  const data = await handleResponse<ListingWithPhotos>(res);
  return { ...data, photos: data.photos ?? [] };
}

export async function createListing(
  body: Record<string, unknown>,
): Promise<ListingWithPhotos> {
  const res = await fetch(`${API_URL}/listings`, {
    method: "POST",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function updateListing(
  id: string,
  body: Record<string, unknown>,
): Promise<ListingWithPhotos> {
  const res = await fetch(`${API_URL}/listings/${id}`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function deleteListing(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/listings/${id}`, {
    method: "DELETE",
    headers: headers(true),
  });
  await handleResponse<void>(res);
}

export async function uploadPhotos(
  listingId: string,
  files: File[],
): Promise<ListingPhoto[]> {
  const form = new FormData();
  for (const f of files) form.append("photos", f);
  const res = await fetch(`${API_URL}/listings/${listingId}/photos`, {
    method: "POST",
    headers: headers(true),
    body: form,
  });
  return handleResponse(res);
}

export async function deletePhoto(
  listingId: string,
  photoId: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/listings/${listingId}/photos/${photoId}`,
    { method: "DELETE", headers: headers(true) },
  );
  await handleResponse<void>(res);
}

export function photoUrl(relativeUrl: string): string {
  return `${API_URL}${relativeUrl}`;
}
