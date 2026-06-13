import { apiFetch } from "./api";
import type { Document } from "./types";

export interface BackupFile {
  version: 1;
  exportedAt: string;
  documents: Document[];
}

/**
 * Downloads a JSON backup of all documents belonging to the
 * current session.
 */
export async function exportBackup(): Promise<void> {
  const res = await apiFetch("/api/documents", { cache: "no-store" });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const documents: Document[] = await res.json();

  const payload: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    documents,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "notion-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a backup JSON file and bulk-imports its documents into
 * the current session. Documents keep their original IDs, so
 * re-importing a backup is idempotent. Returns the number of
 * documents processed.
 */
export async function importBackup(file: File): Promise<number> {
  const text = await file.text();
  const data = JSON.parse(text);

  const documents: Document[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.documents)
      ? data.documents
      : [];

  if (documents.length === 0) {
    throw new Error("Backup file contains no documents.");
  }

  const res = await apiFetch("/api/documents/import", {
    method: "POST",
    body: JSON.stringify({ documents }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Import failed (${res.status})`);
  }
  const result = await res.json();
  return typeof result.count === "number" ? result.count : documents.length;
}
