import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExamType } from "@prisma/client";

// GET /api/predictor?exam=JEE_MAIN&rank=15000&category=General&branch=Computer%20Science
//
// Matching logic: a college/branch/category combination is a viable match if
// closingRank >= user's rank (their rank would have cleared that cutoff).
// Results are sorted by closingRank ascending so the "tightest" realistic
// matches (closest to the user's actual rank) appear first, since those are
// the most competitive colleges they could realistically get into.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examParam = searchParams.get("exam");
    const rankParam = searchParams.get("rank");
    const category = searchParams.get("category") || "General";
    const branch = searchParams.get("branch") || undefined;

    if (!examParam || !rankParam) {
      return NextResponse.json(
        { error: "exam and rank are required query params" },
        { status: 400 }
      );
    }

    const validExams = Object.values(ExamType);
    if (!validExams.includes(examParam as ExamType)) {
      return NextResponse.json(
        { error: `exam must be one of: ${validExams.join(", ")}` },
        { status: 400 }
      );
    }

    const rank = parseInt(rankParam, 10);
    if (Number.isNaN(rank) || rank <= 0) {
      return NextResponse.json(
        { error: "rank must be a positive integer" },
        { status: 400 }
      );
    }

    const cutoffs = await prisma.cutoff.findMany({
      where: {
        exam: examParam as ExamType,
        category,
        closingRank: { gte: rank },
        ...(branch ? { branch } : {}),
      },
      orderBy: { closingRank: "asc" },
      take: 30,
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            state: true,
            rating: true,
            avgFeesPerYear: true,
            logoColor: true,
          },
        },
      },
    });

    const results = cutoffs.map((c) => ({
      college: c.college,
      branch: c.branch,
      category: c.category,
      closingRank: c.closingRank,
      margin: c.closingRank - rank, // how much cushion the user has
    }));

    return NextResponse.json({ data: results, count: results.length });
  } catch (err) {
    console.error("GET /api/predictor failed", err);
    return NextResponse.json(
      { error: "Failed to run predictor" },
      { status: 500 }
    );
  }
}
