"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $getRoot, EditorState } from "lexical";
import {
  $createPageBreakSpacerNode,
  PageBreakSpacerNode,
} from "@/nodes/ScreenwritingNodes";

const PAGE_CONTENT_HEIGHT = 864; // 9 inches of content per page
const PAGE_MARGIN_TOP = 96; // 1" top margin
const PAGE_MARGIN_BOTTOM = 96; // 1" bottom margin
const PAGE_SPACING = 40; // Space between pages
const SPACER_HEIGHT = PAGE_MARGIN_BOTTOM + PAGE_MARGIN_TOP + PAGE_SPACING; // 232px

export function PageBreakSpacerPlugin() {
  const [editor] = useLexicalComposerContext();
  const isUpdatingRef = useRef(false);
  const lastSpacerKeysRef = useRef<string>("");

  useEffect(() => {
    let updateTimeout: NodeJS.Timeout | null = null;

    const updatePageBreaks = () => {
      // Prevent recursive updates
      if (isUpdatingRef.current) return;

      // Clear any pending updates
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // Delay to allow DOM to update after editor changes
      updateTimeout = setTimeout(() => {
        isUpdatingRef.current = true;

        try {
          // First, read the current state to get nodes
          editor.getEditorState().read(() => {
            const root = $getRoot();
            const allNodes = root.getChildren();
            const contentNodes = allNodes.filter(
              (child) => !(child instanceof PageBreakSpacerNode)
            );

            if (contentNodes.length === 0) {
              isUpdatingRef.current = false;
              return;
            }

            // Get DOM elements and measure their heights (including margins)
            const nodeHeights: {
              node: (typeof contentNodes)[0];
              height: number;
              key: string;
            }[] = [];

            contentNodes.forEach((node) => {
              const nodeKey = node.getKey();
              const domElement = editor.getElementByKey(nodeKey) as HTMLElement;

              if (domElement) {
                // Get computed style to include margins
                const computedStyle = window.getComputedStyle(domElement);
                const marginTop = parseFloat(computedStyle.marginTop) || 0;
                const marginBottom =
                  parseFloat(computedStyle.marginBottom) || 0;
                const elementHeight =
                  domElement.offsetHeight ||
                  domElement.getBoundingClientRect().height ||
                  0;
                const totalHeight = elementHeight + marginTop + marginBottom;

                nodeHeights.push({ node, height: totalHeight, key: nodeKey });
              }
            });

            // Calculate where page breaks should occur
            // First page starts with top margin (96px), subsequent pages start after spacer
            let currentPageHeight = PAGE_MARGIN_TOP; // Account for first page top margin
            const insertPositions: number[] = [];

            nodeHeights.forEach((item, index) => {
            console.log("currentPageHeight", currentPageHeight, "item.height", item.height, "total", currentPageHeight + item.height);
              const wouldExceed =
                currentPageHeight + item.height > PAGE_CONTENT_HEIGHT + PAGE_MARGIN_TOP + 16;

              if (wouldExceed && currentPageHeight > PAGE_MARGIN_TOP) {
                // We need a page break before this node
                insertPositions.push(index);
                // Start new page (spacer will add the margins)
                currentPageHeight = PAGE_MARGIN_TOP + item.height;
              } else {
                currentPageHeight += item.height;
              }
            });

            // Get current spacer keys to compare
            const existingSpacers = allNodes.filter(
              (child) => child instanceof PageBreakSpacerNode
            ) as PageBreakSpacerNode[];
            const currentSpacerKeys = existingSpacers
              .map((s) => s.getKey())
              .sort()
              .join(",");

            // Only update if spacer positions changed
            if (
              currentSpacerKeys === lastSpacerKeysRef.current &&
              insertPositions.length === existingSpacers.length
            ) {
              isUpdatingRef.current = false;
              return;
            }

            // Now update the editor to insert spacers
            editor.update(
              () => {
                const root = $getRoot();

                // Remove all existing spacer nodes first
                const spacersToRemove: PageBreakSpacerNode[] = [];
                root.getChildren().forEach((child) => {
                  if (child instanceof PageBreakSpacerNode) {
                    spacersToRemove.push(child);
                  }
                });
                spacersToRemove.forEach((spacer) => spacer.remove());

                // Get content nodes again (after removing spacers)
                const nodes = root
                  .getChildren()
                  .filter((child) => !(child instanceof PageBreakSpacerNode));

                // Insert spacers in reverse order to maintain correct indices
                const insertedSpacers: PageBreakSpacerNode[] = [];
                for (let i = insertPositions.length - 1; i >= 0; i--) {
                  const insertIndex = insertPositions[i];
                  if (insertIndex < nodes.length) {
                    const targetNode = nodes[insertIndex];
                    const spacer = $createPageBreakSpacerNode();
                    targetNode.insertBefore(spacer);
                    insertedSpacers.push(spacer);
                  }
                }

                // Update the ref with new spacer keys
                lastSpacerKeysRef.current = insertedSpacers
                  .map((s) => s.getKey())
                  .sort()
                  .join(",");
              },
              {
                // Tag this update so we can skip it in the listener
                tag: "page-break-spacer",
              }
            );

            // Reset flag after a short delay to allow update to complete
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 100);
          });
        } catch (error) {
          console.error("Error updating page breaks:", error);
          isUpdatingRef.current = false;
        }
      }, 200);
    };

    // Listen to editor updates, but skip updates tagged as "page-break-spacer"
    const removeUpdateListener = editor.registerUpdateListener(
      ({
        editorState,
        tags,
      }: {
        editorState: EditorState;
        tags?: Set<string>;
      }) => {
        // Skip if we're currently updating
        if (isUpdatingRef.current) return;

        // Skip if this update was from us inserting spacers
        if (tags?.has("page-break-spacer")) {
          return;
        }

        // Update page breaks
        updatePageBreaks();
      }
    );

    

    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      removeUpdateListener();
    };
  }, [editor]);

  return null;
}
