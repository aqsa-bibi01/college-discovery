import Link from "next/link";

export type CollegeSummary = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  avgFeesPerYear: number;
  rating: number;
  logoColor: string;
};

function formatFees(fees: number) {
  if (fees >= 100000) return `₹${(fees / 100000).toFixed(1)}L / yr`;
  return `₹${(fees / 1000).toFixed(0)}K / yr`;
}

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-light px-2.5 py-1 text-xs font-semibold text-teal">
      {rating.toFixed(1)}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.3l7.1-.7L12 2z" />
      </svg>
    </span>
  );
}

export default function CollegeCard({
  college,
  compareSelected,
  onToggleCompare,
}: {
  college: CollegeSummary;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  return (
    <div className="group relative flex items-start gap-4 border-b border-border py-6 first:pt-0">
      <div
        className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-display text-lg font-semibold text-paper"
        style={{ backgroundColor: college.logoColor }}
        aria-hidden
      >
        {college.name.charAt(0)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <Link
            href={`/college/${college.slug}`}
            className="font-display text-lg font-semibold text-ink hover:text-teal transition-colors"
          >
            {college.name}
          </Link>
          <RatingBadge rating={college.rating} />
        </div>
        <p className="mt-1 text-sm text-slate">
          {college.city}, {college.state} · {college.type}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-ink">
            {formatFees(college.avgFeesPerYear)}
          </span>
          <Link
            href={`/college/${college.slug}`}
            className="text-sm font-medium text-teal hover:underline"
          >
            View details →
          </Link>
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(college.id)}
              className={`ml-auto rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                compareSelected
                  ? "border-amber bg-amber text-ink"
                  : "border-border text-slate hover:border-teal hover:text-teal"
              }`}
            >
              {compareSelected ? "Added to compare" : "Add to compare"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { formatFees };
