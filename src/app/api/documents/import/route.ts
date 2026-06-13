import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IncomingDoc {
  id?: string;
  title?: string;
  content?: string;
  isPublished?: boolean;
  parentDocumentId?: string | null;
  category?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id") ?? "";
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session id" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const incoming: IncomingDoc[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.documents)
        ? body.documents
        : [];

    if (incoming.length === 0) {
      return NextResponse.json(
        { error: "No documents to import" },
        { status: 400 }
      );
    }

    let count = 0;

    // Process in two passes so parents are created before children
    // that reference them. We do this in O(n) using a Map of
    // known IDs in this import batch.
    const seenIds = new Set<string>();

    for (const raw of incoming) {
      if (!raw || typeof raw !== "object") continue;

      const data = {
        title:
          typeof raw.title === "string" && raw.title.length > 0
            ? raw.title
            : "Untitled",
        content: typeof raw.content === "string" ? raw.content : "",
        isPublished: Boolean(raw.isPublished),
        parentDocumentId:
          typeof raw.parentDocumentId === "string" &&
          raw.parentDocumentId.length > 0
            ? raw.parentDocumentId
            : null,
        category:
          typeof raw.category === "string" && raw.category.length > 0
            ? raw.category
            : null,
        sessionId,
      };

      const id =
        typeof raw.id === "string" && raw.id.length > 0 ? raw.id : undefined;

      // If a parent is referenced but hasn't been seen in this
      // batch AND doesn't already exist for this session, drop
      // the reference so we don't violate the FK constraint.
      if (data.parentDocumentId) {
        if (!seenIds.has(data.parentDocumentId)) {
          const parent = await prisma.document.findFirst({
            where: { id: data.parentDocumentId, sessionId },
            select: { id: true },
          });
          if (!parent) {
            data.parentDocumentId = null;
          }
        }
      }

      if (id) {
        const existing = await prisma.document.findFirst({
          where: { id, sessionId },
          select: { id: true },
        });
        if (existing) {
          await prisma.document.update({ where: { id }, data });
        } else {
          await prisma.document.create({ data: { ...data, id } });
        }
        seenIds.add(id);
      } else {
        const created = await prisma.document.create({ data });
        seenIds.add(created.id);
      }
      count++;
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[POST /api/documents/import]", error);
    return NextResponse.json(
      { error: "Failed to import documents" },
      { status: 500 }
    );
  }
}
