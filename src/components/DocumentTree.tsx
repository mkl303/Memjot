"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { buildTree } from "@/lib/tree";
import type { DocumentNode, Document } from "@/lib/types";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface Props {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
}

const UNCATEGORIZED = "Uncategorized";

export function DocumentTree(props: Props) {
  const tree = buildTree(props.documents);

  if (tree.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-gray-400">No pages yet</div>
    );
  }

  // Group root nodes by category. Sub-pages stay nested under
  // their parent in the tree regardless of the child's own
  // category, so the hierarchy is preserved.
  const groups = new Map<string, DocumentNode[]>();
  tree.forEach((node) => {
    const key = node.category ?? UNCATEGORIZED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(node);
  });

  const sortedCategories = Array.from(groups.keys()).sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-2">
      {sortedCategories.map((category) => (
        <div key={category}>
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {category}
          </div>
          <ul className="space-y-0.5">
            {groups.get(category)!.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} {...props} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

interface NodeProps {
  node: DocumentNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
}

function TreeNode({ node, depth, selectedId, onSelect, onCreate }: NodeProps) {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  const remove = async () => {
    if (!confirm(`Delete "${node.title || "Untitled"}"?`)) return;
    await apiFetch(`/api/documents/${node.id}`, { method: "DELETE" });
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("documents:changed"));
  };

  return (
    <li>
      <div
        className={cn(
          "group relative flex items-center gap-1 rounded px-1 py-1 text-sm text-gray-700 hover:bg-gray-200",
          selectedId === node.id && "bg-gray-200 font-medium text-gray-900"
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-4 w-4 items-center justify-center text-gray-500"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <span className="block h-3 w-3" />
          )}
        </button>

        <button
          onClick={() => onSelect(node.id)}
          className="flex flex-1 items-center gap-1.5 truncate text-left"
        >
          <FileText className="h-3.5 w-3.5 shrink-0 text-gray-500" />
          <span className="truncate">{node.title || "Untitled"}</span>
          {node.category && depth === 0 && (
            <span className="ml-1 shrink-0 rounded bg-gray-200 px-1 py-0.5 text-[10px] text-gray-600">
              {node.category}
            </span>
          )}
        </button>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onCreate(node.id)}
            className="rounded p-0.5 text-gray-500 hover:bg-gray-300"
            title="Add sub-page"
          >
            <Plus className="h-3 w-3" />
          </button>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded p-0.5 text-gray-500 hover:bg-gray-300"
              title="More"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 text-xs shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onCreate(node.id);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="h-3 w-3" /> Add sub-page
                </button>
                <button
                  onClick={remove}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-red-600 hover:bg-gray-100"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && hasChildren && (
        <ul className="space-y-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreate={onCreate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
