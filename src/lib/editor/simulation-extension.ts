import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SimulationView } from "@/components/editor/simulation-view";
import { createEmptySpec } from "@/lib/simulation/types";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    simulation: {
      /** Insert an empty simulation block (then opened in the builder). */
      insertSimulation: () => ReturnType;
    };
  }
}

/**
 * An atom block node holding a full simulation spec in its `spec` attribute,
 * serialized into the step's content JSON. Rendered by `SimulationView`, which
 * branches on `editor.isEditable` (builder preview vs. learner player).
 */
export const Simulation = Node.create({
  name: "simulation",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      spec: {
        default: createEmptySpec(),
        parseHTML: (element) => {
          const raw = element.getAttribute("data-spec");
          if (!raw) return createEmptySpec();
          try {
            return JSON.parse(raw);
          } catch {
            return createEmptySpec();
          }
        },
        renderHTML: (attributes) => ({
          "data-spec": JSON.stringify(attributes.spec ?? createEmptySpec()),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="simulation"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "simulation" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SimulationView);
  },

  addCommands() {
    return {
      insertSimulation:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { spec: createEmptySpec() },
          }),
    };
  },
});
