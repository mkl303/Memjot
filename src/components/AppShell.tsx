"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { DocumentEditor } from "./DocumentEditor";
import { EmptyState } from "./EmptyState";
import type { Document } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { getOrCreateSessionId } from "@/lib/session";

export function AppShell() {
  const params = useParams<{ pageId?: string }>();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    params?.pageId ?? null
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      // Ensure the session id exists before the first request.
      getOrCreateSessionId();
      const res = await apiFetch("/api/documents", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Document[] = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setReady(true);
    fetchDocuments();
  }, [fetchDocuments]);

  // Listen for tree-level changes (create/delete/import) so we can re-sync.
  useEffect(() => {
    const handler = () => {
      fetchDocuments();
    };
    window.addEventListener("documents:changed", handler);
    return () => window.removeEventListener("documents:changed", handler);
  }, [fetchDocuments]);

  // Keep selectedId in sync with the URL so that deep-links,
  // browser back/forward, and the "delete current page" path
  // all stay consistent.
  useEffect(() => {
    setSelectedId(params?.pageId ?? null);
  }, [params?.pageId]);

  // If the URL points at a page we can't resolve (deleted,
  // archived, or just never existed), gracefully fall back to
  // the home view. We only do this once data has actually
  // loaded so we don't bounce the user on a cold start.
  useEffect(() => {
    if (
      params?.pageId &&
      !loading &&
      documents.length > 0 &&
      !documents.some((d) => d.id === params.pageId && !d.isArchived)
    ) {
      router.replace("/");
    }
  }, [documents, params?.pageId, loading, router]);

  const createDocument = useCallback(
    async (parentDocumentId: string | null = null) => {
      const res = await apiFetch("/api/documents", {
        method: "POST",
        body: JSON.stringify({ title: "Untitled", parentDocumentId }),
      });
      if (!res.ok) return;
      const doc: Document = await res.json();
      await fetchDocuments();
      setSelectedId(doc.id);
      router.push(`/pages/${doc.id}`);
    },
    [fetchDocuments, router]
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      router.push(`/pages/${id}`);
    },
    [router]
  );

  // Only consider non-archived pages for the "open" view.
  // Archived pages stay in `documents` (so they round-trip
  // through PATCH/restore) but are hidden from the editor.
  const selected =
    documents.find((d) => d.id === selectedId && !d.isArchived) ?? null;

  if (!ready) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar
        documents={documents}
        selectedId={selectedId}
        onSelect={handleSelect}
        onCreate={createDocument}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onChanged={fetchDocuments}
      />
      <main className="relative flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading…
          </div>
        ) : selected ? (
          <DocumentEditor
            key={selected.id}
            document={selected}
            onSaved={fetchDocuments}
          />
        ) : (
          <EmptyState onCreate={() => createDocument(null)} />
        )}
      </main>
    </div>
  );
}
