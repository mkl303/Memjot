import type { Document, DocumentNode } from "./types";

/**
 * Convert a flat list of documents into a hierarchical tree.
 * Documents whose parent isn't in the list are treated as roots.
 */
export function buildTree(documents: Document[]): DocumentNode[] {
  const map = new Map<string, DocumentNode>();

  documents.forEach((doc) => {
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
    nodes.sort((a, b) => a.title.localeCompare(b.title));
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);

  return roots;
}
