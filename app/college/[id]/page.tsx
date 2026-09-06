"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { RatingBadge, formatFees } from "@/components/CollegeCard";
import { getCompareIds, toggleCompareId, MAX_COMPARE } from "@/lib/compareStore";

type Course = { id: string; name: string; degree: string; durationYears: number; feesTotal: number };
type PlacementRow = {
  id: string;
  year: number;
  avgPackageLPA: number;
  medianPackageLPA: number;
  highestPackageLPA: number;
  placementRate: number;
  topRecruiters: string;
};
type ReviewRow = { id: string; authorName: string; rating: number; title: string; body: string; createdAt: string };
type CollegeDetail = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  establishedYear: number | null;
  avgFeesPerYear: number;
  rating: number;
  overview: string;
  logoColor: string;
  courses: Course[];
  placements: PlacementRow[];
  reviews: ReviewRow[];
};

export default function CollegeDetailPage() {
  const params = useParams<{ id: string }>();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/colleges/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setCollege(json.data);
          setInCompare(getCompareIds().includes(json.data.id));
        }
      })
      .catch(() => !cancelled && setError("Couldn't find that college."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="h-8 w-2/3 animate-pulse rounded bg-teal-light/50" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-teal-light/50" />
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-lg text-ink">Couldn&apos;t find that college.</p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-teal hover:underline">
          ← Back to search
        </Link>
      </div>
    );
  }

  const latestPlacement = college.placements[0];

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <div className="flex items-start gap-5 py-10">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl font-display text-2xl font-semibold text-paper"
          style={{ backgroundColor: college.logoColor }}
          aria-hidden
        >
          {college.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{college.name}</h1>
            <RatingBadge rating={college.rating} />
          </div>
          <p className="mt-1 text-slate">
            {college.city}, {college.state} · {college.type}
            {college.establishedYear ? ` · Est. ${college.establishedYear}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-teal-light px-3 py-1.5 text-sm font-medium text-teal">
              {formatFees(college.avgFeesPerYear)}
            </span>
            <button
              onClick={() => setInCompare(toggleCompareId(college.id).includes(college.id))}
              className={`rounded-md border px-4 py-1.5 text-sm font-semibold transition-colors ${
                inCompare
                  ? "border-amber bg-amber text-ink"
                  : "border-border text-slate hover:border-teal hover:text-teal"
              }`}
            >
              {inCompare ? "Added to compare" : `Add to compare (max ${MAX_COMPARE})`}
            </button>
          </div>
        </div>
      </div>

      <section className="border-t border-border py-8">
        <h2 className="font-display text-xl font-semibold text-ink">Overview</h2>
        <p className="mt-3 max-w-2xl text-slate leading-relaxed">{college.overview}</p>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="font-display text-xl font-semibold text-ink">Courses</h2>
        <div className="mt-4 divide-y divide-border">
          {college.courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="text-sm text-slate">{c.degree} · {c.durationYears} years</p>
              </div>
              <p className="text-sm font-medium text-ink">{formatFees(Math.round(c.feesTotal / c.durationYears))}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="font-display text-xl font-semibold text-ink">Placements</h2>
        {latestPlacement && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Avg package" value={`₹${latestPlacement.avgPackageLPA.toFixed(1)}L`} />
            <Stat label="Median package" value={`₹${latestPlacement.medianPackageLPA.toFixed(1)}L`} />
            <Stat label="Highest package" value={`₹${latestPlacement.highestPackageLPA.toFixed(1)}L`} />
            <Stat label="Placement rate" value={`${latestPlacement.placementRate.toFixed(0)}%`} />
          </div>
        )}
        <div className="mt-6 divide-y divide-border">
          {college.placements.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <span className="font-medium text-ink">{p.year}</span>
              <span className="text-slate">Top recruiters: {p.topRecruiters}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-8">
        <h2 className="font-display text-xl font-semibold text-ink">Reviews</h2>
        <div className="mt-4 space-y-6">
          {college.reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{r.title}</p>
                <RatingBadge rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-slate leading-relaxed">{r.body}</p>
              <p className="mt-2 text-xs text-slate/70">— {r.authorName}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-4 py-3">
      <p className="text-xs text-slate">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
