import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

function getSessionId(req: NextRequest): string {
  return req.headers.get("x-session-id") ?? "";
}

async function findOwnedDoc(id: string, sessionId: string) {
  if (!sessionId) return null;
  return prisma.document.findFirst({ where: { id, sessionId } });
}

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const sessionId = getSessionId(req);
    const document = await findOwnedDoc(params.id, sessionId);
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
    const sessionId = getSessionId(req);
    const existing = await findOwnedDoc(params.id, sessionId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
    if (body.category !== undefined) {
      data.category =
        typeof body.category === "string" && body.category.length > 0
          ? body.category
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

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const sessionId = getSessionId(req);
    const existing = await findOwnedDoc(params.id, sessionId);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

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
