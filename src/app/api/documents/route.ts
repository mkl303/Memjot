import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
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
    const body = await req.json();
    const { title, content, parentDocumentId, isPublished } = body ?? {};

    const document = await prisma.document.create({
      data: {
        title:
          typeof title === "string" && title.length > 0 ? title : "Untitled",
        content: typeof content === "string" ? content : "",
        parentDocumentId:
          typeof parentDocumentId === "string" && parentDocumentId.length > 0
            ? parentDocumentId
            : null,
        isPublished: Boolean(isPublished),
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
