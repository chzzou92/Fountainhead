"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { TextNode } from "lexical";
import { useEffect } from "react";
import { SceneHeadingNode, CharacterNode, TransitionNode, ShotNode } from "@/nodes/ScreenwritingNodes";

export function UppercasePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node: TextNode) => {
      const parent = node.getParent();
      if (parent instanceof SceneHeadingNode || parent instanceof CharacterNode || parent instanceof TransitionNode || parent instanceof ShotNode) {
        const text = node.getTextContent();
        // Only transform if text contains lowercase letters
        if (/[a-z]/.test(text)) {
          const upperText = text.toUpperCase();
          node.setTextContent(upperText);
        }
      }
    });
  }, [editor]);

  return null;
}

