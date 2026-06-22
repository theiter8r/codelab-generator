"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import {
  BookmarkPlus,
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LayoutTemplate,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { getExtensions } from "@/lib/editor/extensions";
import { MediaLibrary } from "@/components/editor/media-library";
import { TemplatePicker } from "@/components/editor/template-picker";
import { createTemplate } from "@/lib/actions/templates";
import { cn } from "@/lib/utils";
import type { TiptapDoc } from "@/lib/types";

export function RichEditor({
  initialContent,
  onChange,
}: {
  initialContent: TiptapDoc | null;
  onChange: (doc: TiptapDoc) => void;
}) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getExtensions({ editable: true }),
    content: initialContent ?? undefined,
    editorProps: {
      attributes: {
        class: "prose-content min-h-72 px-4 py-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapDoc),
  });

  async function saveAsTemplate() {
    if (!editor) return;
    const name = window.prompt("Save this step's content as a template named:");
    if (!name?.trim()) return;
    setSavingTemplate(true);
    const res = await createTemplate({
      name: name.trim(),
      content: editor.getJSON() as TiptapDoc,
    });
    setSavingTemplate(false);
    if ("error" in res) {
      alert(`Could not save template: ${res.error}`);
    } else {
      alert(`Saved "${name.trim()}" to your templates.`);
    }
  }

  if (!editor) {
    return (
      <div className="h-80 animate-pulse rounded-lg border border-border bg-muted/40" />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Toolbar
        editor={editor}
        savingTemplate={savingTemplate}
        onPickImage={() => setMediaOpen(true)}
        onPickTemplate={() => setTemplatesOpen(true)}
        onSaveTemplate={saveAsTemplate}
      />
      <EditorContent editor={editor} />

      <MediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
      />
      <TemplatePicker
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onInsert={(content) => {
          if (content) editor.chain().focus().insertContent(content).run();
        }}
      />
    </div>
  );
}

function Toolbar({
  editor,
  savingTemplate,
  onPickImage,
  onPickTemplate,
  onSaveTemplate,
}: {
  editor: Editor;
  savingTemplate: boolean;
  onPickImage: () => void;
  onPickTemplate: () => void;
  onSaveTemplate: () => void;
}) {
  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-subtle p-1.5">
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} label="Bold">
        <Bold className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} label="Italic">
        <Italic className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} label="Strikethrough">
        <Strikethrough className="size-4" />
      </Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="Heading 2">
        <Heading2 className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="Heading 3">
        <Heading3 className="size-4" />
      </Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} label="Bullet list">
        <List className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} label="Numbered list">
        <ListOrdered className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} label="Quote">
        <Quote className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} label="Code block">
        <Code2 className="size-4" />
      </Btn>
      <Divider />
      <Btn onClick={setLink} active={editor.isActive("link")} label="Link">
        <Link2 className="size-4" />
      </Btn>
      <Btn onClick={onPickImage} label="Insert image from pool">
        <ImageIcon className="size-4" />
      </Btn>
      <Divider />
      <Btn onClick={onPickTemplate} label="Insert template">
        <LayoutTemplate className="size-4" />
      </Btn>
      <Btn onClick={onSaveTemplate} disabled={savingTemplate} label="Save as template">
        <BookmarkPlus className="size-4" />
      </Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().undo().run()} label="Undo" disabled={!editor.can().undo()}>
        <Undo2 className="size-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} label="Redo" disabled={!editor.can().redo()}>
        <Redo2 className="size-4" />
      </Btn>
    </div>
  );
}

function Btn({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:bg-muted hover:text-foreground active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" />;
}
