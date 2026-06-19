import type { Document, DocumentNode } from "./types";

interface BuildTreeOptions {
  includeArchived?: boolean;
}

/**
 * Convert a flat list of documents into a hierarchical tree.
 * Documents whose parent isn't in the list are treated as roots.
 *
 * Archived documents are filtered out by default. Pass
 * `includeArchived: true` to keep them — they will sort to the
 * bottom of each level so the active tree stays readable.
 */
export function buildTree(
  documents: Document[],
  options: BuildTreeOptions = {}
): DocumentNode[] {
  const { includeArchived = false } = options;

  const filtered = includeArchived
    ? documents
    : documents.filter((d) => !d.isArchived);

  const map = new Map<string, DocumentNode>();

  filtered.forEach((doc) => {
    map.set(doc.id, { ...doc, children: [] });
  });

  const roots: DocumentNode[] = [];

  map.forEach((node) => {
    if (node.parentDocumentId && map.has(node.parentDocumentId)) {
      map.get(node.parentDocumentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (nodes: DocumentNode[]) => {
    nodes.sort((a, b) => {
      // Archived nodes sink to the bottom of each level.
      if (a.isArchived !== b.isArchived) {
        return a.isArchived ? 1 : -1;
      }
      return a.title.localeCompare(b.title);
    });
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);

  return roots;
}
