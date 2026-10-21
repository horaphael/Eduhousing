"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  fetchListings,
  photoUrl,
  type ListingWithPhotos,
  type ListingFilters,
} from "@/lib/api";

const HOUSING_TYPES = [
  { value: "studio", label: "Studio" },
  { value: "t1", label: "T1" },
  { value: "t2", label: "T2" },
  { value: "t3_plus", label: "T3+" },
  { value: "shared_room", label: "Chambre" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Plus recentes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix decroissant" },
];

function filtersFromParams(sp: URLSearchParams): ListingFilters {
  const f: ListingFilters = {};
  const city = sp.get("ville");
  if (city) f.city = city;
  const minR = sp.get("min");
  if (minR) f.min_rent = parseInt(minR, 10);
  const maxR = sp.get("max");
  if (maxR) f.max_rent = parseInt(maxR, 10);
  const type = sp.get("type");
  if (type) f.housing_type = type.split(",");
  const meuble = sp.get("meuble");
  if (meuble === "1") f.furnished = true;
  if (meuble === "0") f.furnished = false;
  const minS = sp.get("surface");
  if (minS) f.min_surface = parseFloat(minS);
  const avail = sp.get("dispo");
  if (avail) f.available_by = avail;
  const sort = sp.get("tri");
  if (sort) f.sort = sort;
  return f;
}

function filtersToParams(f: ListingFilters): string {
  const sp = new URLSearchParams();
  if (f.city?.trim()) sp.set("ville", f.city.trim());
  if (f.min_rent !== undefined) sp.set("min", String(f.min_rent));
  if (f.max_rent !== undefined) sp.set("max", String(f.max_rent));
  if (f.housing_type?.length) sp.set("type", f.housing_type.join(","));
  if (f.furnished === true) sp.set("meuble", "1");
  if (f.furnished === false) sp.set("meuble", "0");
  if (f.min_surface !== undefined) sp.set("surface", String(f.min_surface));
  if (f.available_by) sp.set("dispo", f.available_by);
  if (f.sort && f.sort !== "recent") sp.set("tri", f.sort);
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

function countActiveFilters(f: ListingFilters): number {
  let n = 0;
  if (f.min_rent !== undefined) n++;
  if (f.max_rent !== undefined) n++;
  if (f.housing_type?.length) n++;
  if (f.furnished !== undefined) n++;
  if (f.min_surface !== undefined) n++;
  if (f.available_by) n++;
  if (f.sort && f.sort !== "recent") n++;
  return n;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main>
          <p className="loading">Chargement...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = filtersFromParams(searchParams);

  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [cityInput, setCityInput] = useState(initialFilters.city ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<ListingFilters>(initialFilters);

  // Draft filter state for the panel
  const [draftMinRent, setDraftMinRent] = useState(
    initialFilters.min_rent?.toString() ?? "",
  );
  const [draftMaxRent, setDraftMaxRent] = useState(
    initialFilters.max_rent?.toString() ?? "",
  );
  const [draftTypes, setDraftTypes] = useState<string[]>(
    initialFilters.housing_type ?? [],
  );
  const [draftFurnished, setDraftFurnished] = useState<string>(
    initialFilters.furnished === true
      ? "true"
      : initialFilters.furnished === false
        ? "false"
        : "",
  );
  const [draftMinSurface, setDraftMinSurface] = useState(
    initialFilters.min_surface?.toString() ?? "",
  );
  const [draftAvailableBy, setDraftAvailableBy] = useState(
    initialFilters.available_by ?? "",
  );
  const [draftSort, setDraftSort] = useState(
    initialFilters.sort ?? "recent",
  );

  const doSearch = useCallback((f: ListingFilters) => {
    setLoading(true);
    setError("");
    setAppliedFilters(f);
    const apiFilters: ListingFilters = {};
    if (f.city?.trim()) apiFilters.city = f.city.trim();
    if (f.min_rent !== undefined) apiFilters.min_rent = f.min_rent;
    if (f.max_rent !== undefined) apiFilters.max_rent = f.max_rent;
    if (f.housing_type?.length) apiFilters.housing_type = f.housing_type;
    if (f.furnished !== undefined) apiFilters.furnished = f.furnished;
    if (f.min_surface !== undefined) apiFilters.min_surface = f.min_surface;
    if (f.available_by) apiFilters.available_by = f.available_by;
    if (f.sort && f.sort !== "recent") apiFilters.sort = f.sort;
    fetchListings(Object.keys(apiFilters).length > 0 ? apiFilters : undefined)
      .then(setListings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    doSearch(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildFilters(): ListingFilters {
    const f: ListingFilters = {};
    if (cityInput.trim()) f.city = cityInput.trim();
    if (draftMinRent) f.min_rent = parseInt(draftMinRent, 10);
    if (draftMaxRent) f.max_rent = parseInt(draftMaxRent, 10);
    if (draftTypes.length) f.housing_type = [...draftTypes];
    if (draftFurnished === "true") f.furnished = true;
    if (draftFurnished === "false") f.furnished = false;
    if (draftMinSurface) f.min_surface = parseFloat(draftMinSurface);
    if (draftAvailableBy) f.available_by = draftAvailableBy;
    if (draftSort && draftSort !== "recent") f.sort = draftSort;
    return f;
  }

  function applyFilters() {
    const f = buildFilters();
    setFilters(f);
    router.push(filtersToParams(f));
    doSearch(f);
    setFiltersOpen(false);
  }

  function handleCitySearch(e: React.FormEvent) {
    e.preventDefault();
    const f = { ...filters, city: cityInput.trim() || undefined };
    if (!f.city) delete f.city;
    setFilters(f);
    router.push(filtersToParams(f));
    doSearch(f);
  }

  function resetAll() {
    setCityInput("");
    setDraftMinRent("");
    setDraftMaxRent("");
    setDraftTypes([]);
    setDraftFurnished("");
    setDraftMinSurface("");
    setDraftAvailableBy("");
    setDraftSort("recent");
    setFilters({});
    setFiltersOpen(false);
    router.push("/");
    doSearch({});
  }

  function removeFilter(key: string) {
    const f = { ...appliedFilters };
    delete (f as Record<string, unknown>)[key];
    if (key === "city") setCityInput("");
    if (key === "min_rent") setDraftMinRent("");
    if (key === "max_rent") setDraftMaxRent("");
    if (key === "housing_type") setDraftTypes([]);
    if (key === "furnished") setDraftFurnished("");
    if (key === "min_surface") setDraftMinSurface("");
    if (key === "available_by") setDraftAvailableBy("");
    if (key === "sort") {
      setDraftSort("recent");
      delete f.sort;
    }
    setFilters(f);
    router.push(filtersToParams(f));
    doSearch(f);
  }

  function toggleType(t: string) {
    setDraftTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  const activeCount = countActiveFilters(appliedFilters);
  const hasAnyFilter = !!appliedFilters.city || activeCount > 0;

  // Build badges for active filters
  const badges: { key: string; label: string }[] = [];
  if (appliedFilters.min_rent !== undefined)
    badges.push({ key: "min_rent", label: `\u2265 ${appliedFilters.min_rent} \u20ac` });
  if (appliedFilters.max_rent !== undefined)
    badges.push({ key: "max_rent", label: `\u2264 ${appliedFilters.max_rent} \u20ac` });
  if (appliedFilters.housing_type?.length) {
    const labels = appliedFilters.housing_type
      .map((t) => HOUSING_TYPES.find((h) => h.value === t)?.label ?? t)
      .join(", ");
    badges.push({ key: "housing_type", label: labels });
  }
  if (appliedFilters.furnished === true)
    badges.push({ key: "furnished", label: "Meuble" });
  if (appliedFilters.furnished === false)
    badges.push({ key: "furnished", label: "Non meuble" });
  if (appliedFilters.min_surface !== undefined)
    badges.push({ key: "min_surface", label: `\u2265 ${appliedFilters.min_surface} m\u00b2` });
  if (appliedFilters.available_by)
    badges.push({ key: "available_by", label: `Avant le ${appliedFilters.available_by}` });
  if (appliedFilters.sort && appliedFilters.sort !== "recent") {
    const sl = SORT_OPTIONS.find((s) => s.value === appliedFilters.sort);
    badges.push({ key: "sort", label: sl?.label ?? appliedFilters.sort });
  }

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Annonces publiees</h1>

      {/* Search bar */}
      <div className="search-bar">
        <form onSubmit={handleCitySearch} className="search-row">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Ex : Montpellier"
            className="search-input"
          />
          <button type="submit" className="btn btn-orange">
            Rechercher
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Filtres{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          {hasAnyFilter && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetAll}
            >
              Reinitialiser
            </button>
          )}
        </form>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="filter-panel">
            <div className="form-row">
              <div className="form-group">
                <label>Loyer min (&euro;)</label>
                <input
                  type="number"
                  min="0"
                  value={draftMinRent}
                  onChange={(e) => setDraftMinRent(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Loyer max (&euro;)</label>
                <input
                  type="number"
                  min="0"
                  value={draftMaxRent}
                  onChange={(e) => setDraftMaxRent(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Type de logement</label>
              <div className="checkbox-group">
                {HOUSING_TYPES.map((h) => (
                  <label key={h.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={draftTypes.includes(h.value)}
                      onChange={() => toggleType(h.value)}
                    />
                    {h.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Meuble</label>
                <select
                  value={draftFurnished}
                  onChange={(e) => setDraftFurnished(e.target.value)}
                >
                  <option value="">Peu importe</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div className="form-group">
                <label>Surface min (m&sup2;)</label>
                <input
                  type="number"
                  min="0"
                  value={draftMinSurface}
                  onChange={(e) => setDraftMinSurface(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Disponible avant le</label>
                <input
                  type="date"
                  value={draftAvailableBy}
                  onChange={(e) => setDraftAvailableBy(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Trier par</label>
                <select
                  value={draftSort}
                  onChange={(e) => setDraftSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-orange"
              onClick={applyFilters}
            >
              Appliquer
            </button>
          </div>
        )}

        {/* Active filter badges */}
        {badges.length > 0 && (
          <div className="filter-badges">
            {badges.map((b) => (
              <span key={b.key} className="filter-badge">
                {b.label}
                <button
                  type="button"
                  onClick={() => removeFilter(b.key)}
                  title="Retirer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <p className="loading">Chargement...</p>
      ) : error ? (
        <div className="error-box">{error}</div>
      ) : (
        <>
          {hasAnyFilter && (
            <p style={{ marginBottom: "1rem" }}>
              {listings.length > 0
                ? `${listings.length} annonce${listings.length > 1 ? "s" : ""}${appliedFilters.city ? ` a ${appliedFilters.city}` : ""}`
                : "Aucune annonce ne correspond a ta recherche."}
              {listings.length === 0 && (
                <>
                  {" "}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={resetAll}
                  >
                    Reinitialiser les filtres
                  </button>
                </>
              )}
            </p>
          )}
          {!hasAnyFilter && listings.length === 0 && (
            <p>Aucune annonce pour le moment.</p>
          )}
          {listings.length > 0 && (
            <div className="listings-grid">
              {listings.map((l) => {
                const photo = (l.photos ?? [])[0];
                return (
                  <Link
                    href={`/annonces/${l.id}`}
                    key={l.id}
                    className="listing-card"
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {photo ? (
                      <img src={photoUrl(photo.url)} alt={l.title} />
                    ) : (
                      <div className="no-photo-placeholder">Pas de photo</div>
                    )}
                    <div className="card-body">
                      <h3>{l.title}</h3>
                      <span className="price">
                        {(l.rent_cents / 100).toFixed(0)} &euro;/mois
                      </span>
                      <br />
                      <span className="city">{l.city}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
