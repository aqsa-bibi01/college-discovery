"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatFees } from "@/components/CollegeCard";
import { getCompareIds, toggleCompareId, clearCompare } from "@/lib/compareStore";

type CollegeDetail = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  avgFeesPerYear: number;
  rating: number;
  logoColor: string;
  placements: { year: number; avgPackageLPA: number; placementRate: number }[];
};

export default function ComparePage() {
  const [ids, setIds] = useState<string[]>([]);
  const [colleges, setColleges] = useState<CollegeDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIds(getCompareIds());
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      setColleges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(
      ids.map((id) =>
        fetch(`/api/colleges/${id}`)
          .then((r) => r.json())
          .then((j) => j.data as CollegeDetail)
      )
    )
      .then(setColleges)
      .finally(() => setLoading(false));
  }, [ids]);

  function remove(id: string) {
    setIds(toggleCompareId(id));
  }

  if (ids.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Nothing to compare yet</h1>
        <p className="mt-2 text-slate">
          Add 2–3 colleges from the search page, then come back here to see them side by side.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-teal px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink transition-colors">
          Browse colleges
        </Link>
      </div>
    );
  }

  const latestPlacement = (c: CollegeDetail) => c.placements?.[0];

  const rows: { label: string; render: (c: CollegeDetail) => React.ReactNode }[] = [
    { label: "Location", render: (c) => `${c.city}, ${c.state}` },
    { label: "Type", render: (c) => c.type },
    { label: "Rating", render: (c) => c.rating.toFixed(1) },
    { label: "Fees / year", render: (c) => formatFees(c.avgFeesPerYear) },
    { label: "Avg package (latest)", render: (c) => (latestPlacement(c) ? `₹${latestPlacement(c).avgPackageLPA.toFixed(1)}L` : "—") },
    { label: "Placement rate (latest)", render: (c) => (latestPlacement(c) ? `${latestPlacement(c).placementRate.toFixed(0)}%` : "—") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Compare colleges</h1>
        {colleges.length > 0 && (
          <button
            onClick={() => {
              clearCompare();
              setIds([]);
            }}
            className="text-sm font-medium text-slate hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-8 h-40 animate-pulse rounded-md bg-teal-light/50" />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 border-b border-border py-3 text-left text-slate">&nbsp;</th>
                {colleges.map((c) => (
                  <th key={c.id} className="border-b border-border py-3 px-3 text-left align-bottom">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/college/${c.slug}`} className="font-display text-base font-semibold text-ink hover:text-teal">
                          {c.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => remove(c.id)}
                        aria-label={`Remove ${c.name} from comparison`}
                        className="shrink-0 text-slate hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-border py-3 pr-4 font-medium text-slate">{row.label}</td>
                  {colleges.map((c) => (
                    <td key={c.id} className="border-b border-border px-3 py-3 text-ink">
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
