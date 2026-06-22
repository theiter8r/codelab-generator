"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { getExtensions } from "@/lib/editor/extensions";
import type { TiptapDoc } from "@/lib/types";

/** Read-only renderer for authored step content (shares editor extensions). */
export function ContentViewer({ content }: { content: TiptapDoc | null }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: getExtensions({ editable: false }),
    content: content ?? undefined,
    editorProps: {
      attributes: { class: "prose-content focus:outline-none" },
    },
  });

  // Keep content in sync if the prop changes (e.g. client navigation).
  useEffect(() => {
    if (editor && content) editor.commands.setContent(content);
  }, [editor, content]);

  if (!content || !content.content?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        This step has no content yet.
      </p>
    );
  }

  return <EditorContent editor={editor} />;
}
