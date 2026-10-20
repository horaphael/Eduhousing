"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchListing, updateListing, type ListingWithPhotos } from "@/lib/api";
import ListingForm, { formDataFromListing } from "@/components/ListingForm";

export default function ModifierPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingWithPhotos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchListing(id)
      .then(setListing)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <main><p className="loading">Chargement...</p></main>;
  if (error) return <main><div className="error-box">{error}</div></main>;
  if (!listing) return <main><p>Annonce introuvable.</p></main>;

  async function handleSubmit(
    data: Record<string, unknown>,
    status: string,
  ): Promise<void> {
    const payload = { ...data };
    if (status) payload.status = status;
    for (const key of Object.keys(payload)) {
      if (payload[key] === undefined) delete payload[key];
    }
    if (Object.keys(payload).length === 0) return;
    await updateListing(id, payload);
  }

  async function handleReload() {
    const updated = await fetchListing(id);
    setListing(updated);
  }

  return (
    <main>
      <Link
        href="/mes-annonces"
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        &larr; Retour
      </Link>
      <h1 style={{ marginBottom: "1rem" }}>Modifier l&apos;annonce</h1>
      <ListingForm
        key={listing.updated_at}
        isEdit
        listingId={id}
        initial={formDataFromListing(listing)}
        existingPhotos={listing.photos ?? []}
        onSubmit={handleSubmit}
        onReload={handleReload}
      />
    </main>
  );
}
