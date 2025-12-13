"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useFormat } from "@/contexts/FormatContext";
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  $createTextNode,
} from "lexical";
import {
  $createSceneHeadingNode,
  $createActionNode,
  $createCharacterNode,
  $createDialogueNode,
  $createParentheticalNode,
  $createTransitionNode,
  $createShotNode,
  ParentheticalNode,
} from "@/nodes/ScreenwritingNodes";
import { $setBlocksType } from "@lexical/selection";

export type FormatType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | "shot";

export function useFormatBlock() {
  const [editor] = useLexicalComposerContext();
  const { setActiveFormat } = useFormat();

  const formatBlock = (type: FormatType) => {
    editor.update(() => {
      const selection = $getSelection();

      // Special handling for parenthetical
      if (type === "parenthetical") {
        if (!$isRangeSelection(selection)) {
          const root = $getRoot();
          const lastChild = root.getLastChild();
          const newNode = $createParentheticalNode();

          // Insert "()" with cursor between them
          const openParen = $createTextNode("(");
          const closeParen = $createTextNode(")");
          newNode.append(openParen, closeParen);

          if (lastChild) {
            lastChild.insertAfter(newNode);
          } else {
            root.append(newNode);
          }

          // Place cursor between parentheses
          openParen.selectNext();
          setActiveFormat("parenthetical");
          return;
        }

        // If there's a selection, convert current node to parenthetical
        const anchorNode = selection.anchor.getNode();
        const topLevelNode = anchorNode.getTopLevelElement();

        if (topLevelNode) {
          // Get existing text content
          const textContent = topLevelNode.getTextContent();

          // Remove existing parentheses if present
          let cleanText = textContent.replace(/^\(|\)$/g, "").trim();

          // Create new parenthetical node
          const newNode = $createParentheticalNode();
          const openParen = $createTextNode("(");
          const textNode = $createTextNode(cleanText || "");
          const closeParen = $createTextNode(")");

          newNode.append(openParen, textNode, closeParen);

          // Replace the old node
          topLevelNode.replace(newNode);

          // Place cursor between parentheses (or after opening paren if there's text)
          if (cleanText) {
            textNode.selectEnd();
          } else {
            openParen.selectNext();
          }

          setActiveFormat("parenthetical");
        }
        return;
      }

      // Handle conversion FROM parenthetical to other formats
      if (!$isRangeSelection(selection)) {
        const root = $getRoot();
        const lastChild = root.getLastChild();
        let newNode;
        switch (type) {
          case "scene-heading":
            newNode = $createSceneHeadingNode();
            break;
          case "action":
            newNode = $createActionNode();
            break;
          case "character":
            newNode = $createCharacterNode();
            break;
          case "dialogue":
            newNode = $createDialogueNode();
            break;
          case "transition":
            newNode = $createTransitionNode();
            break;
          case "shot":
            newNode = $createShotNode();
            break;
        }
        if (newNode) {
          if (lastChild) {
            lastChild.insertAfter(newNode);
          } else {
            root.append(newNode);
          }
          newNode.selectEnd();
          setActiveFormat(type);
        }
        return;
      }

      // Get the anchor node (the block containing the selection)
      const anchorNode = selection.anchor.getNode();
      const topLevelNode = anchorNode.getTopLevelElement();

      if (topLevelNode) {
        // If converting from parenthetical, extract text and remove parentheses
        let textToPreserve = "";
        const isParenthetical = topLevelNode instanceof ParentheticalNode;
        if (isParenthetical) {
          // Extract text content, removing parentheses
          const fullText = topLevelNode.getTextContent();
          // Remove opening and closing parentheses
          textToPreserve = fullText.replace(/^\(/, "").replace(/\)$/, "").trim();
        }

        // Create the new node type
        let createNode;
        switch (type) {
          case "scene-heading":
            createNode = $createSceneHeadingNode;
            break;
          case "action":
            createNode = $createActionNode;
            break;
          case "character":
            createNode = $createCharacterNode;
            break;
          case "dialogue":
            createNode = $createDialogueNode;
            break;
          case "transition":
            createNode = $createTransitionNode;
            break;
          case "shot":
            createNode = $createShotNode;
            break;
        }

        // If converting from parenthetical, manually replace the node to preserve text
        if (isParenthetical && textToPreserve !== undefined && createNode) {
          const newNode = createNode();
          if (textToPreserve) {
            const textNode = $createTextNode(textToPreserve);
            newNode.append(textNode);
          }
          topLevelNode.replace(newNode);
          if (textToPreserve) {
            newNode.selectEnd();
          } else {
            newNode.selectStart();
          }
        } else if (createNode) {
          // Use $setBlocksType to convert the block (normal conversion)
          $setBlocksType(selection, createNode);
        }

        setActiveFormat(type);
      }
    });
  };

  return { formatBlock };
}

