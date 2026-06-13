"use client";

import { useEffect, useRef, useState } from "react";
import { Editor } from "./Editor";
import { useDebounce } from "@/hooks/useDebounce";
import type { Document } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface Props {
  document: Document;
  onSaved: () => void;
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function DocumentEditor({ document, onSaved }: Props) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const lastSavedRef = useRef({
    title: document.title,
    content: document.content,
  });

  // Reset local state when the selected document changes.
  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
    setStatus("saved");
    lastSavedRef.current = {
      title: document.title,
      content: document.content,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);

  const debouncedTitle = useDebounce(title, 700);
  const debouncedContent = useDebounce(content, 700);

  useEffect(() => {
    const last = lastSavedRef.current;
    if (
      debouncedTitle === last.title &&
      debouncedContent === last.content
    ) {
      return;
    }

    let cancelled = false;
    setStatus("saving");

    fetch(`/api/documents/${document.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: debouncedTitle,
        content: debouncedContent,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        if (cancelled) return;
        lastSavedRef.current = {
          title: debouncedTitle,
          content: debouncedContent,
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
  }, [debouncedTitle, debouncedContent, document.id, onSaved]);

  const remove = async () => {
    if (!confirm(`Delete "${title || "Untitled"}"?`)) return;
    await fetch(`/api/documents/${document.id}`, { method: "DELETE" });
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
        className="mx-12 mb-4 mt-2 bg-transparent text-4xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
      />

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
