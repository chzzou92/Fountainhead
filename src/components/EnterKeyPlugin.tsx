"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  KEY_ENTER_COMMAND,
  COMMAND_PRIORITY_HIGH,
  $getRoot,
  $isTextNode,
  $createTextNode,
} from "lexical";
import { useEffect } from "react";
import {
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  $createSceneHeadingNode,
  $createActionNode,
  $createCharacterNode,
  $createDialogueNode,
} from "@/nodes/ScreenwritingNodes";
import { useFormat } from "@/contexts/FormatContext";

export function EnterKeyPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setActiveFormat } = useFormat();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        let nextFormat: "scene-heading" | "action" | "character" | "dialogue" =
          "action";
        let createNextNode: () =>
          | ActionNode
          | CharacterNode
          | DialogueNode
          | SceneHeadingNode = $createActionNode;

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }

          // Get the top-level element node
          const anchorNode = selection.anchor.getNode();
          const topLevelNode = anchorNode.getTopLevelElement();

          if (!topLevelNode) {
            return false;
          }

          // Use getType() for more reliable node type detection
          const nodeType = topLevelNode.getType();

          // Determine next node type based on current node
          // Check instanceof FIRST, then getType() as fallback
          // IMPORTANT: Check parenthetical BEFORE action since both extend ParagraphNode
          if (
            topLevelNode instanceof SceneHeadingNode ||
            nodeType === "scene-heading"
          ) {
            // Scene → Action
            createNextNode = $createActionNode;
            nextFormat = "action";
          } else if (
            topLevelNode instanceof CharacterNode ||
            nodeType === "character"
          ) {
            // Character → Dialogue
            createNextNode = $createDialogueNode;
            nextFormat = "dialogue";
          } else if (
            topLevelNode instanceof DialogueNode ||
            nodeType === "dialogue"
          ) {
            // Dialogue → Action
            createNextNode = $createActionNode;
            nextFormat = "action";
          } else if (
            topLevelNode instanceof ParentheticalNode ||
            nodeType === "parenthetical"
          ) {
            // Parenthetical → Dialogue
            createNextNode = $createDialogueNode;
            nextFormat = "dialogue";
          } else if (
            topLevelNode instanceof ActionNode ||
            nodeType === "action"
          ) {
            // Action → Action (stays on Action)
            createNextNode = $createActionNode;
            nextFormat = "action";
          } else {
            // Default to Action
            createNextNode = $createActionNode;
            nextFormat = "action";
          }

          // Special handling for parenthetical nodes
          const isParenthetical =
            topLevelNode instanceof ParentheticalNode ||
            nodeType === "parenthetical";

          // Check if we're at the end of the node
          const textContent = topLevelNode.getTextContent();
          const offset = selection.anchor.offset;
          const isAtEnd = offset >= textContent.length;

          if (isAtEnd) {
            // Check current node position first to determine if we need page break
            const editorElement = editor.getRootElement();
            let marginNeeded = 0;
            let needsPageBreak = false;

            if (editorElement) {
              const editableArea = editorElement.querySelector(
                '[contenteditable="true"]'
              ) as HTMLElement;

              if (editableArea) {
                // Get cursor position
                const selection = window.getSelection();
                let cursorBottom = 0;

                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const cursorRect = range.getBoundingClientRect();
                  const editableRect = editableArea.getBoundingClientRect();
                  const topPadding = 96; // 1" top margin
                  cursorBottom =
                    cursorRect.bottom - editableRect.top - topPadding;
                }

                // Find the current node (topLevelNode) in the DOM
                const allBlocks = Array.from(
                  editableArea.querySelectorAll(
                    "p, div[data-lexical-editor] > div > div"
                  )
                ) as HTMLElement[];

                // Get the actual text bottom position (not just block bottom with whitespace)
                // Check the last few blocks to find the current one
                let textBottom = 0;
                for (
                  let i = allBlocks.length - 1;
                  i >= Math.max(0, allBlocks.length - 5);
                  i--
                ) {
                  const block = allBlocks[i];

                  // Get the actual text content bottom by finding text nodes
                  const textContent = block.textContent?.trim();
                  if (textContent && textContent.length > 0) {
                    // Use Range API to get the actual end of text content
                    const range = document.createRange();

                    // Find all text nodes in the block
                    const walker = document.createTreeWalker(
                      block,
                      NodeFilter.SHOW_TEXT,
                      null
                    );

                    const textNodes: Node[] = [];
                    let node;
                    while ((node = walker.nextNode())) {
                      if (node.textContent?.trim()) {
                        textNodes.push(node);
                      }
                    }

                    if (textNodes.length > 0) {
                      // Use the last text node to get the actual text bottom
                      const lastTextNode = textNodes[textNodes.length - 1];
                      range.selectNodeContents(lastTextNode);
                      range.collapse(false); // Collapse to end of text
                      const textRect = range.getBoundingClientRect();
                      const editableRect = editableArea.getBoundingClientRect();
                      const topPadding = 96;
                      const nodeTextBottom =
                        textRect.bottom - editableRect.top - topPadding;
                      textBottom = Math.max(textBottom, nodeTextBottom);
                    } else {
                      // Fallback: use block's bottom if no text nodes found
                      const blockRect = block.getBoundingClientRect();
                      const editableRect = editableArea.getBoundingClientRect();
                      const topPadding = 96;
                      textBottom = Math.max(
                        textBottom,
                        blockRect.bottom - editableRect.top - topPadding
                      );
                    }
                  }
                }

                // Use whichever is lower: cursor position or text bottom
                const bottomPosition = Math.max(cursorBottom, textBottom);

                // Check if this position would overflow into bottom margin
                const currentPageContentHeight = bottomPosition % 864;
                const estimatedLineHeight = 24;

                // If position + new line would exceed page content height (864px)
                if (currentPageContentHeight + estimatedLineHeight > 864) {
                  needsPageBreak = true;
                  // Calculate margin to push new node to start of next page
                  const currentPage = Math.floor(bottomPosition / 864);
                  const nextPageStart = (currentPage + 1) * 864;
                  // Margin needed = next page start - current position
                  marginNeeded = nextPageStart - currentPageContentHeight;
                }
              }
            }

            // Create new node
            const newNode = createNextNode();
            topLevelNode.insertAfter(newNode);

            // Apply page break margin if needed
            if (needsPageBreak && marginNeeded > 0) {
              // Use setTimeout to apply margin after DOM updates
              setTimeout(() => {
                const editorElement = editor.getRootElement();
                if (!editorElement) return;

                const editableArea = editorElement.querySelector(
                  '[contenteditable="true"]'
                ) as HTMLElement;
                if (!editableArea) return;

                // Find the newly created node (should be the last block)
                const allBlocks = editableArea.querySelectorAll(
                  "p, div[data-lexical-editor] > div > div"
                );
                const newBlock = allBlocks[allBlocks.length - 1] as HTMLElement;
                if (newBlock) {
                  newBlock.style.marginTop = `${marginNeeded}px`;
                }
              }, 50);
            }

            newNode.selectStart();
          } else if (isParenthetical) {
            // Special handling for parenthetical: keep closing paren on same line
            // Find the closing parenthesis in the full text
            const closingParenIndex = textContent.lastIndexOf(")");

            let textToKeepInParen = "";
            let textForNewNode = "";

            if (closingParenIndex !== -1 && closingParenIndex >= offset) {
              // Closing paren exists after or at cursor position
              // Keep everything from start up to and including the closing paren
              textToKeepInParen = textContent.substring(
                0,
                closingParenIndex + 1
              );
              // Text after the closing paren goes to new node
              textForNewNode = textContent
                .substring(closingParenIndex + 1)
                .trim();
            } else if (closingParenIndex !== -1 && closingParenIndex < offset) {
              // Closing paren is before cursor (shouldn't happen normally, but handle it)
              textToKeepInParen = textContent.substring(
                0,
                closingParenIndex + 1
              );
              textForNewNode = textContent
                .substring(closingParenIndex + 1)
                .trim();
            } else {
              // No closing paren found, add one after text before cursor
              const beforeText = textContent.substring(0, offset);
              textToKeepInParen = beforeText + ")";
              textForNewNode = textContent.substring(offset).trim();
            }

            // Rebuild the parenthetical node
            const children = topLevelNode.getChildren();
            children.forEach((child) => child.remove());

            const parenTextNode = $createTextNode(textToKeepInParen);
            topLevelNode.append(parenTextNode);

            // Create and insert new node with text after the closing paren
            const newNode = createNextNode();
            if (textForNewNode) {
              const afterTextNode = $createTextNode(textForNewNode);
              newNode.append(afterTextNode);
            }
            topLevelNode.insertAfter(newNode);
            newNode.selectStart();
          } else {
            // Need to split: get text before and after cursor
            const beforeText = textContent.substring(0, offset);
            const afterText = textContent.substring(offset);

            // Remove all children and add text before cursor
            const children = topLevelNode.getChildren();
            children.forEach((child) => child.remove());
            if (beforeText) {
              const textNode = $createTextNode(beforeText);
              topLevelNode.append(textNode);
            }

            // Create and insert new node with text after cursor
            const newNode = createNextNode();
            if (afterText) {
              const afterTextNode = $createTextNode(afterText);
              newNode.append(afterTextNode);
            }
            topLevelNode.insertAfter(newNode);
            newNode.selectStart();
          }

          // Prevent default Enter behavior
          if (event) {
            event.preventDefault();
          }

          return true;
        });

        // Set format immediately and also after a small delay to ensure it sticks
        // This prevents SelectionChangePlugin from overriding it
        setActiveFormat(nextFormat);
        setTimeout(() => {
          setActiveFormat(nextFormat);
        }, 10);
        setTimeout(() => {
          setActiveFormat(nextFormat);
        }, 50);

        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, setActiveFormat]);

  return null;
}
