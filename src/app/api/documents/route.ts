import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

function getUserId(req: NextRequest): string {
  return req.headers.get("x-user-id") ?? "";
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      // No caller identity → return an empty list rather than
      // leaking other users' data or surfacing a 4xx that would
      // break the client's optimistic-empty-state rendering.
      return NextResponse.json([]);
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[GET /api/documents]", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      // Creating a document without an owner is unsafe — refuse
      // explicitly rather than silently inserting an "anonymous"
      // row that the caller will never be able to fetch back.
      return NextResponse.json(
        { error: "Missing x-user-id header" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, content, parentDocumentId, isPublished, category } =
      body ?? {};

    const document = await prisma.document.create({
      data: {
        title:
          typeof title === "string" && title.length > 0 ? title : "Untitled",
        content: typeof content === "string" ? content : "",
        parentDocumentId:
          typeof parentDocumentId === "string" &&
          parentDocumentId.length > 0
            ? parentDocumentId
            : null,
        isPublished: Boolean(isPublished),
        category:
          typeof category === "string" && category.length > 0
            ? category
            : null,
        userId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("[POST /api/documents]", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
