"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

/**
 * Code block with a language label and copy button. Used in both the editor
 * and the read-only viewer so authored snippets look identical everywhere.
 */
export function CodeBlockView({ node }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const language = (node.attrs.language as string) || "plaintext";

  function copy() {
    const text = node.textContent;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <NodeViewWrapper className="group relative my-4">
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-subtle px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{language}</span>
        <button
          type="button"
          onClick={copy}
          contentEditable={false}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground active:scale-[0.97]"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[var(--success)]" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="!mt-0 overflow-x-auto rounded-b-lg rounded-t-none border border-border bg-[var(--subtle)] p-4 text-sm">
        <NodeViewContent
          as={"code" as "div"}
          className={`hljs language-${language}`}
        />
      </pre>
    </NodeViewWrapper>
  );
}
