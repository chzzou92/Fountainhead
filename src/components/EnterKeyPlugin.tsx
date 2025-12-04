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
            // Simple case: just insert new node after
            const newNode = createNextNode();
            topLevelNode.insertAfter(newNode);
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
