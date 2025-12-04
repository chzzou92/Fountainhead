"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $getRoot,
  $isElementNode,
  $createTextNode,
  $isTextNode,
} from "lexical";
import {
  $createSceneHeadingNode,
  $createActionNode,
  $createCharacterNode,
  $createDialogueNode,
  $createParentheticalNode,
  $createTransitionNode,
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  TransitionNode,
} from "@/nodes/ScreenwritingNodes";
import { $setBlocksType } from "@lexical/selection";
import { SelectionChangePlugin } from "./SelectionChangePlugin";
import { useFormat } from "@/contexts/FormatContext";

export default function ScreenwritingToolbar() {
  const [editor] = useLexicalComposerContext();
  const { activeFormat, setActiveFormat } = useFormat();

  const formatBlock = (
    type:
      | "scene-heading"
      | "action"
      | "character"
      | "dialogue"
      | "parenthetical"
      | "transition"
  ) => {
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
        }
        if (lastChild) {
          lastChild.insertAfter(newNode);
        } else {
          root.append(newNode);
        }
        newNode.selectEnd();
        setActiveFormat(type);
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
          textToPreserve = fullText
            .replace(/^\(/, "")
            .replace(/\)$/, "")
            .trim();
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
        }

        // If converting from parenthetical, manually replace the node to preserve text
        if (isParenthetical && textToPreserve !== undefined) {
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
        } else {
          // Use $setBlocksType to convert the block (normal conversion)
          $setBlocksType(selection, createNode);
        }

        setActiveFormat(type);
      }
    });
  };

  return (
    <>
      <SelectionChangePlugin />
      <nav className="screenwriting-navbar">
        <button
          onClick={() => formatBlock("scene-heading")}
          className={`screenwriting-nav-btn ${
            activeFormat === "scene-heading" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Scene</span>
        </button>
        <button
          onClick={() => formatBlock("action")}
          className={`screenwriting-nav-btn ${
            activeFormat === "action" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <span>Action</span>
        </button>
        <button
          onClick={() => formatBlock("character")}
          className={`screenwriting-nav-btn ${
            activeFormat === "character" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5" />
            <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
          </svg>
          <span>Character</span>
        </button>
        <button
          onClick={() => formatBlock("parenthetical")}
          className={`screenwriting-nav-btn ${
            activeFormat === "parenthetical" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <path d="M8 4C5.5 4 4 7 4 12s1.5 8 4 8" />
            <path d="M16 4c2.5 0 4 3 4 8s-1.5 8-4 8" />
          </svg>
          <span>Parens</span>
        </button>
        <button
          onClick={() => formatBlock("dialogue")}
          className={`screenwriting-nav-btn ${
            activeFormat === "dialogue" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Dialogue</span>
        </button>
        <button
          onClick={() => formatBlock("transition")}
          className={`screenwriting-nav-btn ${
            activeFormat === "transition" ? "active" : ""
          }`}
        >
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>Transition</span>
        </button>
        <button className="screenwriting-nav-btn" disabled>
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Shot</span>
        </button>
        <button className="screenwriting-nav-btn" disabled>
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Note</span>
        </button>
        <button className="screenwriting-nav-btn" disabled>
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span>Sequence</span>
        </button>
        <button className="screenwriting-nav-btn" disabled>
          <svg className="screenwriting-icon" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h8" />
            <path d="M8 14h4" />
          </svg>
          <span>Dual</span>
        </button>
      </nav>
    </>
  );
}
