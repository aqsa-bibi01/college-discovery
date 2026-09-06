import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/colleges?q=&city=&state=&type=&maxFees=&minRating=&sort=&page=&pageSize=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";
    const type = searchParams.get("type") || "";
    const maxFees = searchParams.get("maxFees");
    const minRating = searchParams.get("minRating");
    const sort = searchParams.get("sort") || "rating_desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("pageSize") || "12", 10))
    );

    const where: Prisma.CollegeWhereInput = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { state: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        city ? { city: { equals: city, mode: "insensitive" } } : {},
        state ? { state: { equals: state, mode: "insensitive" } } : {},
        type ? { type: { equals: type, mode: "insensitive" } } : {},
        maxFees ? { avgFeesPerYear: { lte: parseInt(maxFees, 10) } } : {},
        minRating ? { rating: { gte: parseFloat(minRating) } } : {},
      ],
    };

    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      sort === "fees_asc"
        ? { avgFeesPerYear: "asc" }
        : sort === "fees_desc"
        ? { avgFeesPerYear: "desc" }
        : sort === "name_asc"
        ? { name: "asc" }
        : { rating: "desc" }; // default

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          type: true,
          avgFeesPerYear: true,
          rating: true,
          logoColor: true,
        },
      }),
      prisma.college.count({ where }),
    ]);

    return NextResponse.json({
      data: colleges,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (err) {
    console.error("GET /api/colleges failed", err);
    return NextResponse.json(
      { error: "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}
