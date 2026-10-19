"use client";

import { useRouter } from "next/navigation";
import { createListing } from "@/lib/api";
import ListingForm from "@/components/ListingForm";

export default function PublierPage() {
  const router = useRouter();

  async function handleSubmit(
    data: Record<string, unknown>,
    status: string,
  ): Promise<string> {
    const result = await createListing({ ...data, status });
    router.push("/mes-annonces");
    return result.id;
  }

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Publier une annonce</h1>
      <ListingForm onSubmit={handleSubmit} />
    </main>
  );
}
