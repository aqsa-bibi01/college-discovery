import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pathfinder — College Discovery",
  description:
    "Search, compare, and predict your college admissions with real placement and cutoff data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="border-b border-border sticky top-0 z-40 bg-paper/95 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-display text-xl font-semibold tracking-tight text-ink"
            >
              Pathfinder
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-slate">
              <Link href="/" className="hover:text-ink transition-colors">
                Explore
              </Link>
              <Link href="/compare" className="hover:text-ink transition-colors">
                Compare
              </Link>
              <Link
                href="/predictor"
                className="rounded-md bg-teal px-4 py-2 text-paper hover:bg-ink transition-colors"
              >
                Rank Predictor
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border mt-24">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate flex flex-col sm:flex-row justify-between gap-2">
            <p>Pathfinder — a demo college discovery platform.</p>
            <p>Built with Next.js, Prisma &amp; PostgreSQL.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
