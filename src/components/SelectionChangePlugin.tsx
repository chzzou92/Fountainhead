"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";
import {
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  TransitionNode,
  ShotNode
} from "@/nodes/ScreenwritingNodes";
import { useFormat } from "@/contexts/FormatContext";

export function SelectionChangePlugin() {
  const [editor] = useLexicalComposerContext();
  const { setActiveFormat } = useFormat();

  useEffect(() => {
    let updateTimeout: NodeJS.Timeout | null = null;

    return editor.registerUpdateListener(({ editorState }) => {
      // Clear any pending updates
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // Add a delay to allow EnterKeyPlugin to set format first
      // Increased delay to ensure EnterKeyPlugin's format change takes precedence
      updateTimeout = setTimeout(() => {
        editorState.read(() => {
          const selection = $getSelection();
          let topLevelNode = null;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            topLevelNode = anchorNode.getTopLevelElement();
          } else if (selection) {
            const nodes = selection.getNodes();
            if (nodes.length > 0) {
              topLevelNode = nodes[0].getTopLevelElement();
            }
          }

          if (!topLevelNode) {
            // Default to "action" if no node found, so one button is always highlighted
            setActiveFormat("action");
            return;
          }

          // Use both getType() and instanceof for reliable detection
          const nodeType = topLevelNode.getType();

          if (
            nodeType === "scene-heading" ||
            topLevelNode instanceof SceneHeadingNode
          ) {
            setActiveFormat("scene-heading");
          } else if (
            nodeType === "action" ||
            topLevelNode instanceof ActionNode
          ) {
            setActiveFormat("action");
          } else if (
            nodeType === "character" ||
            topLevelNode instanceof CharacterNode
          ) {
            setActiveFormat("character");
          } else if (
            nodeType === "dialogue" ||
            topLevelNode instanceof DialogueNode
          ) {
            setActiveFormat("dialogue");
          } else if (
            nodeType === "parenthetical" ||
            topLevelNode instanceof ParentheticalNode
          ) {
            setActiveFormat("parenthetical");
          } else if (
            nodeType === "transition" ||
            topLevelNode instanceof TransitionNode
          ) {
            setActiveFormat("transition");
          } else if (
            nodeType === "shot" ||
            topLevelNode instanceof ShotNode
          ) {
            setActiveFormat("shot");
          } else {
            // Default to "action" for unknown node types, so one button is always highlighted
            setActiveFormat("action");
          }
        });
      }, 50); // Delay to let EnterKeyPlugin set format first
    });
  }, [editor, setActiveFormat]);

  return null;
}
