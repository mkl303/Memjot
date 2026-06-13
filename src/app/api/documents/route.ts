import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getSessionId(req: NextRequest): string {
  return req.headers.get("x-session-id") ?? "";
}

export async function GET(req: NextRequest) {
  try {
    // --- ESKİ AUTH KONTROLÜ VE ARAMA MANTIĞI (Yarın aktif edilecek) ---
    // const sessionId = getSessionId(req);
    // if (!sessionId) {
    //   // No session yet (shouldn't happen with the client wrapper,
    //   // but stay safe). Return an empty list rather than leaking
    //   // other users' data.
    //   return NextResponse.json([]);
    // }
    // const documents = await prisma.document.findMany({
    //   where: { sessionId },
    //   orderBy: { updatedAt: "desc" },
    // });
    // ------------------------------------------------------------------

    // --- YENİ GEÇİCİ KOD (Anonim test için) ---
    const documents = await prisma.document.findMany({
      where: { sessionId: "anonymous" }, 
      orderBy: { updatedAt: "desc" },
    });
    // ------------------------------------------

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
    // --- AUTH KONTROL(yarin aktif edilecek) ---
    // const sessionId = getSessionId(req);
    // if (!sessionId) {
    //   return NextResponse.json(
    //     { error: "Missing session id" },
    //     { status: 400 }
    //   );
    // }
    // --------------------------------------------

    const body = await req.json();
    const { title, content, parentDocumentId, isPublished, category } = body ?? {};

    const document = await prisma.document.create({
      data: {
        title: typeof title === "string" && title.length > 0 ? title : "Untitled",
        content: typeof content === "string" ? content : "",
        parentDocumentId: typeof parentDocumentId === "string" && parentDocumentId.length > 0 ? parentDocumentId : null,
        isPublished: Boolean(isPublished),
        category: typeof category === "string" && category.length > 0 ? category : null,
        sessionId: "anonymous", // Yarın Auth gelince burası user.id olacak
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
