"use client";

import { useState } from "react";
import Link from "next/link";
import { formatFees, RatingBadge } from "@/components/CollegeCard";

const EXAMS = [
  { value: "JEE_MAIN", label: "JEE Main" },
  { value: "JEE_ADVANCED", label: "JEE Advanced" },
  { value: "NEET", label: "NEET" },
  { value: "CAT", label: "CAT" },
  { value: "CUET", label: "CUET" },
  { value: "STATE_CET", label: "State CET" },
];

const BRANCHES = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Electrical Engineering",
];

const CATEGORIES = ["General", "OBC", "EWS"];

type Result = {
  college: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    rating: number;
    avgFeesPerYear: number;
    logoColor: string;
  };
  branch: string;
  category: string;
  closingRank: number;
  margin: number;
};

export default function PredictorPage() {
  const [exam, setExam] = useState("JEE_MAIN");
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("General");
  const [branch, setBranch] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rank || Number(rank) <= 0) {
      setError("Enter a valid rank.");
      return;
    }
    setLoading(true);
    setError(null);
    setRevealed(false);
    try {
      const params = new URLSearchParams({ exam, rank, category });
      if (branch) params.set("branch", branch);
      const res = await fetch(`/api/predictor?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Prediction failed");
      setResults(json.data);
      requestAnimationFrame(() => setRevealed(true));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Rank predictor</h1>
      <p className="mt-3 max-w-xl text-slate">
        Enter your exam and rank to see colleges where your rank clears the branch cutoff. Results
        are ordered by how close a fit each college is to your rank, not by name or brand.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Exam</span>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2.5 focus:border-teal focus:outline-none"
          >
            {EXAMS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Your rank</span>
          <input
            type="number"
            min={1}
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="e.g. 15000"
            className="rounded-md border border-border bg-white px-3 py-2.5 focus:border-teal focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2.5 focus:border-teal focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Branch (optional)</span>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2.5 focus:border-teal focus:outline-none"
          >
            <option value="">Any branch</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-60"
        >
          {loading ? "Checking cutoffs…" : "Predict my colleges"}
        </button>
      </form>

      {error && <p className="mt-6 text-sm text-red-700">{error}</p>}

      {results && (
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-sm text-slate">
            {results.length} match{results.length === 1 ? "" : "es"} found — ordered by closest cutoff to your rank.
          </p>
          {results.length === 0 ? (
            <p className="mt-4 text-slate">No colleges matched. Try a different branch or category.</p>
          ) : (
            <div
              className={`mt-4 divide-y divide-border transition-all duration-500 ease-out ${
                revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {results.map((r, i) => (
                <div key={`${r.college.id}-${r.branch}-${r.category}-${i}`} className="flex items-start gap-4 py-5">
                  <div
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-base font-semibold text-paper"
                    style={{ backgroundColor: r.college.logoColor }}
                    aria-hidden
                  >
                    {r.college.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                      <Link href={`/college/${r.college.slug}`} className="font-display text-base font-semibold text-ink hover:text-teal">
                        {r.college.name}
                      </Link>
                      <RatingBadge rating={r.college.rating} />
                    </div>
                    <p className="mt-1 text-sm text-slate">
                      {r.college.city}, {r.college.state} · {r.branch} · {r.category}
                    </p>
                    <p className="mt-1 text-sm text-ink">
                      Closing rank {r.closingRank.toLocaleString()} · {formatFees(r.college.avgFeesPerYear)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
