"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export function Editor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing…",
      }),
    ],
    content: value || "",
    immediatelyRender: false, // important for Next.js SSR
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none min-h-[400px] focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. document switch) into the editor.
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="h-[400px] animate-pulse rounded bg-gray-50" />;
  }

  const tools: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    run: () => void;
    active: boolean;
  }> = [
    {
      icon: Heading1,
      label: "Heading 1",
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      label: "Heading 2",
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Bold,
      label: "Bold",
      run: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      icon: Italic,
      label: "Italic",
      run: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      label: "Strike",
      run: () => editor.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    {
      icon: Code,
      label: "Inline code",
      run: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    {
      icon: List,
      label: "Bulleted list",
      run: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      run: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      label: "Quote",
      run: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
  ];

  return (
    <div>
      <div className="sticky top-0 z-10 mb-2 flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 bg-white/80 p-1 backdrop-blur">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.run}
            title={t.label}
            className={cn(
              "rounded p-1.5 text-gray-600 hover:bg-gray-100",
              t.active && "bg-gray-100 text-gray-900"
            )}
          >
            <t.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
