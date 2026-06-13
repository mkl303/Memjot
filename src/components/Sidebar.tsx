"use client";

import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { DocumentTree } from "./DocumentTree";
import type { Document } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: (parentId: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  documents,
  selectedId,
  onSelect,
  onCreate,
  isOpen,
  onToggle,
}: Props) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-gray-200 bg-gray-50 transition-[width] duration-200",
        isOpen ? "w-72" : "w-12"
      )}
    >
      <div className="flex h-12 items-center gap-1 border-b border-gray-200 px-2">
        {isOpen && (
          <div className="flex items-center gap-2 px-1 text-sm font-semibold text-gray-700">
            <FileText className="h-4 w-4" />
            <span>My Workspace</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "rounded p-1.5 text-gray-500 hover:bg-gray-200",
            isOpen ? "ml-auto" : "mx-auto"
          )}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="space-y-1 p-2">
            <button
              onClick={() => onCreate(null)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              <span>New page</span>
            </button>
            <div className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </div>
          </div>

          <div className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            Pages
          </div>
          <div className="flex-1 overflow-y-auto px-1 pb-2">
            <DocumentTree
              documents={documents}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreate={onCreate}
            />
          </div>
        </>
      )}
    </aside>
  );
}
