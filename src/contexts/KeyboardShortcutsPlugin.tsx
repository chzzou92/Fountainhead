"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { useFormatBlock } from "@/hooks/useFormatBlock";

export function KeyboardShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();
  const { formatBlock } = useFormatBlock();

  useEffect(() => {
    // Key mapping: Command/Ctrl + number key → format type
    const keyMap: Record<string, string> = {
      "1": "scene-heading",
      "2": "action",
      "3": "character",
      "4": "parenthetical",
      "5": "dialogue",
      "6": "transition",
      "7": "shot",
    };

    // Get the editor's root element (the contenteditable div)
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command (Mac) or Ctrl (Windows/Linux)
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) return;

      // Check if the pressed key matches our mapping
      const formatType = keyMap[event.key];
      if (formatType) {
        event.preventDefault();
        event.stopPropagation();
        formatBlock(formatType as any);
      }
    };

    editorRoot.addEventListener("keydown", handleKeyDown);

    return () => {
      editorRoot.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, formatBlock]);

  return null;
}
