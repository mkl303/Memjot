"use client";

import { FileText } from "lucide-react";

interface Props {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center text-gray-400">
      <FileText className="mb-4 h-12 w-12" />
      <h2 className="mb-1 text-lg font-semibold text-gray-700">
        No page selected
      </h2>
      <p className="mb-5 max-w-sm text-sm">
        Pick a page from the sidebar, or create a new one to get started.
      </p>
      <button
        onClick={onCreate}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
      >
        + New page
      </button>
    </div>
  );
}
