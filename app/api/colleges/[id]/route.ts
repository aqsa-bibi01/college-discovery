import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/colleges/:id  (id can be the cuid or the slug)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const college = await prisma.college.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        courses: true,
        placements: { orderBy: { year: "desc" } },
        reviews: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ data: college });
  } catch (err) {
    console.error("GET /api/colleges/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to fetch college" },
      { status: 500 }
    );
  }
}
