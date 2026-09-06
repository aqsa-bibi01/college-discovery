"use client";

export type FilterState = {
  q: string;
  city: string;
  state: string;
  type: string;
  maxFees: string;
  minRating: string;
  sort: string;
};

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  city: "",
  state: "",
  type: "",
  maxFees: "",
  minRating: "",
  sort: "rating_desc",
};

const STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Uttarakhand",
  "Assam",
  "Madhya Pradesh",
];

const FEE_CAPS = [
  { label: "Any fees", value: "" },
  { label: "Under ₹1L / yr", value: "100000" },
  { label: "Under ₹2L / yr", value: "200000" },
  { label: "Under ₹3L / yr", value: "300000" },
];

export default function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  function set<K extends keyof FilterState>(key: K, v: FilterState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search by college, city, or state"
        value={value.q}
        onChange={(e) => set("q", e.target.value)}
        className="w-full rounded-md border border-border bg-white px-4 py-3 text-sm text-ink placeholder:text-slate/70 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={value.state}
          onChange={(e) => set("state", e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={value.type}
          onChange={(e) => set("type", e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
        >
          <option value="">Any type</option>
          <option value="Government">Government</option>
          <option value="Private">Private</option>
          <option value="Deemed">Deemed</option>
        </select>

        <select
          value={value.maxFees}
          onChange={(e) => set("maxFees", e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
        >
          {FEE_CAPS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        <select
          value={value.minRating}
          onChange={(e) => set("minRating", e.target.value)}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
        >
          <option value="">Any rating</option>
          <option value="4.5">4.5+</option>
          <option value="4">4.0+</option>
          <option value="3.5">3.5+</option>
        </select>

        <select
          value={value.sort}
          onChange={(e) => set("sort", e.target.value)}
          className="ml-auto rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
        >
          <option value="rating_desc">Sort: Rating (high to low)</option>
          <option value="fees_asc">Sort: Fees (low to high)</option>
          <option value="fees_desc">Sort: Fees (high to low)</option>
          <option value="name_asc">Sort: Name (A–Z)</option>
        </select>
      </div>
    </div>
  );
}
