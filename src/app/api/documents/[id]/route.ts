import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(document);
  } catch (error) {
    console.error("[GET /api/documents/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.content === "string") data.content = body.content;
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;
    if (body.parentDocumentId !== undefined) {
      data.parentDocumentId =
        typeof body.parentDocumentId === "string" &&
        body.parentDocumentId.length > 0
          ? body.parentDocumentId
          : null;
    }

    const document = await prisma.document.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[PATCH /api/documents/:id]", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await prisma.document.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/documents/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
