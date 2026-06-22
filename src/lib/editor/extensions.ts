import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import type { AnyExtension } from "@tiptap/core";
import { CodeBlockView } from "@/components/editor/code-block-view";
import { Simulation } from "@/lib/editor/simulation-extension";

export const lowlight = createLowlight(common);

const CodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({ lowlight, defaultLanguage: "plaintext" });

/**
 * Shared extension set so authored content renders identically in the editor
 * and the read-only viewer. `editable` toggles placeholder behaviour.
 */
export function getExtensions({ editable }: { editable: boolean }): AnyExtension[] {
  return [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight below
      link: false, // configured separately below with custom options
    }),
    CodeBlock,
    Simulation,
    Image.configure({ HTMLAttributes: { class: "rounded-lg border border-border" } }),
    Link.configure({
      openOnClick: !editable,
      autolink: true,
      HTMLAttributes: { class: "text-primary underline underline-offset-2" },
    }),
    ...(editable
      ? [
          Placeholder.configure({
            placeholder: "Write this step… use the toolbar for code blocks and images.",
          }),
        ]
      : []),
  ];
}
