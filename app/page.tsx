"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import CollegeCard, { CollegeSummary } from "@/components/CollegeCard";
import Filters, { DEFAULT_FILTERS, FilterState } from "@/components/Filters";
import { getCompareIds, toggleCompareId, MAX_COMPARE } from "@/lib/compareStore";

type ApiResponse = {
  data: CollegeSummary[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const debouncedFilters = useDebounced(filters, 350);

  const [colleges, setColleges] = useState<CollegeSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    setCompareIds(getCompareIds());
    const handler = () => setCompareIds(getCompareIds());
    window.addEventListener("compare-updated", handler);
    return () => window.removeEventListener("compare-updated", handler);
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedFilters]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedFilters.q) params.set("q", debouncedFilters.q);
    if (debouncedFilters.city) params.set("city", debouncedFilters.city);
    if (debouncedFilters.state) params.set("state", debouncedFilters.state);
    if (debouncedFilters.type) params.set("type", debouncedFilters.type);
    if (debouncedFilters.maxFees) params.set("maxFees", debouncedFilters.maxFees);
    if (debouncedFilters.minRating) params.set("minRating", debouncedFilters.minRating);
    params.set("sort", debouncedFilters.sort);
    params.set("page", String(page));
    params.set("pageSize", "10");
    return params.toString();
  }, [debouncedFilters, page]);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/colleges?${queryString}`);
      if (!res.ok) throw new Error("Request failed");
      const json: ApiResponse = await res.json();
      setColleges((prev) => (page === 1 ? json.data : [...prev, ...json.data]));
      setTotalPages(json.pagination.totalPages);
      setTotal(json.pagination.total);
    } catch {
      setError("Couldn't load colleges. Check that the database is seeded and running.");
    } finally {
      setLoading(false);
    }
  }, [queryString, page]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-14 sm:py-20">
        <p className="text-sm font-medium text-teal">College discovery, decided by data</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Find the right college, not just a popular one.
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate">
          Search {total > 0 ? total : "dozens of"} colleges with real fees, placement
          records, and admission cutoffs — then compare your shortlist side by side.
        </p>
      </section>

      <section className="pb-6">
        <Filters value={filters} onChange={setFilters} />
      </section>

      {compareIds.length > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-md border border-amber bg-amber/10 px-4 py-3 text-sm">
          <span className="text-ink">
            {compareIds.length} college{compareIds.length > 1 ? "s" : ""} selected for
            comparison (max {MAX_COMPARE}).
          </span>
          <Link
            href="/compare"
            className="font-semibold text-teal hover:underline"
          >
            Compare now →
          </Link>
        </div>
      )}

      <section>
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && colleges.length === 0 && !loading && (
          <p className="py-10 text-center text-slate">
            No colleges match these filters. Try widening your search.
          </p>
        )}

        <div>
          {colleges.map((c) => (
            <CollegeCard
              key={c.id}
              college={c}
              compareSelected={compareIds.includes(c.id)}
              onToggleCompare={(id) => setCompareIds(toggleCompareId(id))}
            />
          ))}
        </div>

        {loading && (
          <div className="space-y-6 py-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-md bg-teal-light/50" />
            ))}
          </div>
        )}

        {!loading && page < totalPages && (
          <div className="flex justify-center py-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-teal px-6 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal hover:text-paper"
            >
              Load more colleges
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
