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

interface Props {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
}

export function DocumentTree(props: Props) {
  const tree = buildTree(props.documents);

  if (tree.length === 0) {
    return (
      <div className="px-3 py-2 text-xs text-gray-400">No pages yet</div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode key={node.id} node={node} depth={0} {...props} />
      ))}
    </ul>
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
    await fetch(`/api/documents/${node.id}`, { method: "DELETE" });
    setMenuOpen(false);
    // Notify AppShell to re-fetch and clear selection if needed.
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
