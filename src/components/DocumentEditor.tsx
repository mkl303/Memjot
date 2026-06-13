"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "./Editor";
import { useDebounce } from "@/hooks/useDebounce";
import type { Document } from "@/lib/types";
import { Tag, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Props {
  document: Document;
  onSaved: () => void;
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function DocumentEditor({ document, onSaved }: Props) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [category, setCategory] = useState(document.category ?? "");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const lastSavedRef = useRef({
    title: document.title,
    content: document.content,
    category: document.category ?? "",
  });

  // Reset local state when the selected document changes.
  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
    setCategory(document.category ?? "");
    setStatus("saved");
    lastSavedRef.current = {
      title: document.title,
      content: document.content,
      category: document.category ?? "",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);

  const debouncedTitle = useDebounce(title, 700);
  const debouncedContent = useDebounce(content, 700);
  const debouncedCategory = useDebounce(category, 700);

  useEffect(() => {
    const last = lastSavedRef.current;
    if (
      debouncedTitle === last.title &&
      debouncedContent === last.content &&
      debouncedCategory === last.category
    ) {
      return;
    }

    let cancelled = false;
    setStatus("saving");

    apiFetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: debouncedTitle,
        content: debouncedContent,
        category: debouncedCategory.length > 0 ? debouncedCategory : null,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        if (cancelled) return;
        lastSavedRef.current = {
          title: debouncedTitle,
          content: debouncedContent,
          category: debouncedCategory,
        };
        setStatus("saved");
        onSaved();
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [
    debouncedTitle,
    debouncedContent,
    debouncedCategory,
    document.id,
    onSaved,
  ]);

  const remove = async () => {
    if (!confirm(`Delete "${title || "Untitled"}"?`)) return;
    await apiFetch(`/api/documents/${document.id}`, { method: "DELETE" });
    window.dispatchEvent(new CustomEvent("documents:changed"));
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="flex items-center justify-between px-12 pt-10">
        <div className="text-xs text-gray-400">
          {status === "saving" && "Saving…"}
          {status === "saved" && "Saved"}
          {status === "unsaved" && "Unsaved changes"}
          {status === "error" && (
            <span className="text-red-500">Failed to save</span>
          )}
        </div>
        <button
          onClick={remove}
          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500"
          title="Delete page"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setStatus("unsaved");
        }}
        placeholder="Untitled"
        className="mx-12 mb-2 mt-2 bg-transparent text-4xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
      />

      <div className="mx-12 mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Tag className="h-3.5 w-3.5 shrink-0" />
        <input
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setStatus("unsaved");
          }}
          placeholder="Add a category (e.g. Work, Personal)"
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-12 pb-12">
        <Editor
          value={content}
          onChange={(v) => {
            setContent(v);
            setStatus("unsaved");
          }}
        />
      </div>
    </div>
  );
}
