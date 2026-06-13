"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { DocumentEditor } from "./DocumentEditor";
import { EmptyState } from "./EmptyState";
import type { Document } from "@/lib/types";

export function AppShell() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents", { cache: "no-store" });
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
    fetchDocuments();
  }, [fetchDocuments]);

  // Listen for tree-level changes (create/delete) so we can re-sync.
  useEffect(() => {
    const handler = () => {
      fetchDocuments();
    };
    window.addEventListener("documents:changed", handler);
    return () => window.removeEventListener("documents:changed", handler);
  }, [fetchDocuments]);

  // If the currently selected doc disappears, clear the selection.
  useEffect(() => {
    if (selectedId && !documents.some((d) => d.id === selectedId)) {
      setSelectedId(null);
    }
  }, [documents, selectedId]);

  const createDocument = useCallback(
    async (parentDocumentId: string | null = null) => {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", parentDocumentId }),
      });
      if (!res.ok) return;
      const doc: Document = await res.json();
      await fetchDocuments();
      setSelectedId(doc.id);
    },
    [fetchDocuments]
  );

  const selected = documents.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar
        documents={documents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={createDocument}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
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
