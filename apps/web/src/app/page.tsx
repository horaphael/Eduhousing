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

const POPULAR_CITIES = [
  { name: "Montpellier", img: "https://placehold.co/400x300/1C5FA8/ffffff?text=Montpellier" },
  { name: "Paris", img: "https://placehold.co/400x300/123A6B/ffffff?text=Paris" },
  { name: "Lyon", img: "https://placehold.co/400x300/1C5FA8/ffffff?text=Lyon" },
  { name: "Toulouse", img: "https://placehold.co/400x300/123A6B/ffffff?text=Toulouse" },
  { name: "Bordeaux", img: "https://placehold.co/400x300/1C5FA8/ffffff?text=Bordeaux" },
  { name: "Lille", img: "https://placehold.co/400x300/123A6B/ffffff?text=Lille" },
];

const HOUSING_TYPE_LABELS: Record<string, string> = {
  studio: "Studio",
  t1: "T1",
  t2: "T2",
  t3_plus: "T3+",
  shared_room: "Colocation",
};

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
        <main className="container">
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
  const hasInitialFilters =
    !!initialFilters.city || countActiveFilters(initialFilters) > 0;

  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [cityInput, setCityInput] = useState(initialFilters.city ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listings, setListings] = useState<ListingWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedFilters, setAppliedFilters] =
    useState<ListingFilters>(initialFilters);

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

  function searchCity(city: string) {
    setCityInput(city);
    const f = { ...filters, city };
    setFilters(f);
    router.push(filtersToParams(f));
    doSearch(f);
  }

  const activeCount = countActiveFilters(appliedFilters);
  const hasAnyFilter = !!appliedFilters.city || activeCount > 0;

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
    <>
      {/* Hero section */}
      {!hasInitialFilters && (
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="hero-text">
              <p className="hero-surtitle">Logement etudiant simplifie</p>
              <h1>Ton logement, simplifie</h1>
              <p>
                Cherche pres de ton campus, compare, reserve ta visite :
                tout au meme endroit.
              </p>
              <form onSubmit={handleCitySearch} className="hero-search">
                <div className="hero-search-field">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Ville ou campus"
                  />
                </div>
                <button type="submit" className="hero-search-btn">
                  Rechercher
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      <main className="container">
        {/* Search bar (visible when filters active) */}
        {hasInitialFilters && (
          <div className="search-section">
            <form onSubmit={handleCitySearch} className="search-bar">
              <div className="search-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Rechercher une ville..."
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Rechercher
              </button>
              <button
                type="button"
                className="btn btn-filter"
                onClick={() => setFiltersOpen((o) => !o)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="8" y1="12" x2="20" y2="12" />
                  <line x1="12" y1="18" x2="20" y2="18" />
                </svg>
                Filtres{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
              {hasAnyFilter && (
                <button type="button" className="btn btn-ghost" onClick={resetAll}>
                  Reinitialiser
                </button>
              )}
            </form>
          </div>
        )}

        {/* Filter panel */}
        {filtersOpen && (
          <div className="filter-panel">
            <div className="filter-panel-header">
              <h3>Filtres</h3>
              <button className="filter-close" onClick={() => setFiltersOpen(false)}>&times;</button>
            </div>
            <div className="filter-grid">
              <div className="form-group">
                <label>Loyer min</label>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0"
                    value={draftMinRent}
                    onChange={(e) => setDraftMinRent(e.target.value)}
                    placeholder="0"
                  />
                  <span>&euro;/mois</span>
                </div>
              </div>
              <div className="form-group">
                <label>Loyer max</label>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0"
                    value={draftMaxRent}
                    onChange={(e) => setDraftMaxRent(e.target.value)}
                    placeholder="2000"
                  />
                  <span>&euro;/mois</span>
                </div>
              </div>
              <div className="form-group">
                <label>Surface min</label>
                <div className="input-suffix">
                  <input
                    type="number"
                    min="0"
                    value={draftMinSurface}
                    onChange={(e) => setDraftMinSurface(e.target.value)}
                    placeholder="0"
                  />
                  <span>m&sup2;</span>
                </div>
              </div>
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
            </div>

            <div className="form-group">
              <label>Type de logement</label>
              <div className="type-chips">
                {HOUSING_TYPES.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    className={`chip ${draftTypes.includes(h.value) ? "chip-active" : ""}`}
                    onClick={() => toggleType(h.value)}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-grid">
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

            <div className="filter-actions">
              <button type="button" className="btn btn-primary" onClick={applyFilters}>
                Appliquer les filtres
              </button>
            </div>
          </div>
        )}

        {/* Active filter badges */}
        {badges.length > 0 && (
          <div className="filter-badges">
            {badges.map((b) => (
              <span key={b.key} className="filter-badge">
                {b.label}
                <button type="button" onClick={() => removeFilter(b.key)} title="Retirer">
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-section">
            <div className="spinner" />
            <p>Chargement des annonces...</p>
          </div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : (
          <>
            {hasAnyFilter && (
              <div className="results-header">
                <h2>
                  {listings.length > 0
                    ? `${listings.length} logement${listings.length > 1 ? "s" : ""}${appliedFilters.city ? ` a ${appliedFilters.city}` : ""}`
                    : "Aucun resultat"}
                </h2>
                {listings.length === 0 && (
                  <p className="no-results-text">
                    Essayez d&apos;elargir vos criteres de recherche.{" "}
                    <button className="link-btn" onClick={resetAll}>
                      Reinitialiser les filtres
                    </button>
                  </p>
                )}
              </div>
            )}

            {!hasAnyFilter && listings.length > 0 && (
              <div className="section-header">
                <h2>Annonces recentes</h2>
                <p>Decouvre les derniers logements disponibles</p>
              </div>
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
                    >
                      <div className="card-img-wrap">
                        {photo ? (
                          <img src={photoUrl(photo.url)} alt={l.title} />
                        ) : (
                          <div className="no-photo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                        <span className="card-type-badge">
                          {HOUSING_TYPE_LABELS[l.housing_type] || l.housing_type}
                        </span>
                        {l.furnished && <span className="card-furnished-badge">Meuble</span>}
                      </div>
                      <div className="card-body">
                        <h3 className="card-title">{l.title}</h3>
                        <p className="card-location">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {l.city}
                        </p>
                        <div className="card-details">
                          {l.surface_m2 && <span>{l.surface_m2} m&sup2;</span>}
                          {l.charges_cents > 0 && (
                            <span>+ {(l.charges_cents / 100).toFixed(0)} &euro; charges</span>
                          )}
                          {l.dpe_grade && <span>DPE {l.dpe_grade}</span>}
                        </div>
                        <div className="card-price-row">
                          <div className="card-price">
                            {(l.rent_cents / 100).toFixed(0)} &euro;
                            <span> /mois</span>
                          </div>
                          <span className="card-cta">Voir l&apos;annonce</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!hasAnyFilter && listings.length === 0 && (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <h3>Aucune annonce pour le moment</h3>
                <p>Sois le premier a publier une annonce !</p>
                <Link href="/publier" className="btn btn-accent">
                  Publier une annonce
                </Link>
              </div>
            )}
          </>
        )}

        {/* Popular cities (homepage without filters) */}
        {!hasInitialFilters && !loading && (
          <section className="cities-section">
            <div className="section-header">
              <h2>Villes etudiantes populaires</h2>
              <p>Explore les logements dans les grandes villes universitaires</p>
            </div>
            <div className="cities-grid">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city.name}
                  className="city-card"
                  onClick={() => searchCity(city.name)}
                >
                  <img src={city.img} alt={city.name} />
                  <div className="city-card-overlay">
                    <span>{city.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* How it works (homepage) */}
        {!hasInitialFilters && !loading && (
          <section className="how-section">
            <div className="section-header">
              <h2>Comment ca marche</h2>
              <p>Trouve ton logement en 3 etapes simples</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="step-number">01</p>
                <h3>Recherche</h3>
                <p>Parcours les annonces par ville, type de logement et budget.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="step-number">02</p>
                <h3>Contacte</h3>
                <p>Echange directement avec le proprietaire via la messagerie.</p>
              </div>
              <div className="step-card">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="step-number">03</p>
                <h3>Emmenage</h3>
                <p>Signe ton bail en toute confiance et installe-toi.</p>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
