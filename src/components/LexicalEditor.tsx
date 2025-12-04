"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { EditorState } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $getSelection } from "lexical";
import { useEffect } from "react";
import {
  SceneHeadingNode,
  ActionNode,
  CharacterNode,
  DialogueNode,
  ParentheticalNode,
  TransitionNode,
} from "@/nodes/ScreenwritingNodes";
import ScreenwritingToolbar from "./ScreenwritingToolbar";
import { UppercasePlugin } from "./UppercasePlugin";
import { EnterKeyPlugin } from "./EnterKeyPlugin";
import { FormatProvider } from "@/contexts/FormatContext";
import { PageWrapper } from "./PageWrapper";

const theme = {
  paragraph: "mb-2",
};

function OnChangePlugin({
  onChange,
}: {
  onChange: (editorState: EditorState) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState);
    });
  }, [editor, onChange]);
  return null;
}

const initialConfig = {
  namespace: "FountainheadEditor",
  theme,
  onError: (error: Error) => {
    console.error(error);
  },
  nodes: [
    SceneHeadingNode,
    ActionNode,
    CharacterNode,
    DialogueNode,
    ParentheticalNode,
    TransitionNode,
  ],
};

export default function LexicalEditor() {
  const onChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const selection = $getSelection();
      // You can access the editor state here if needed
    });
  };

  return (
    <FormatProvider>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative w-full">
          <div className="sticky top-0 z-50 bg-white border-b border-gray-300">
            <ScreenwritingToolbar />
          </div>
          <PageWrapper>
            <div
              className="relative min-h-[400px] bg-transparent"
              style={{
                fontFamily: 'Courier, "Courier New", monospace',
                fontSize: "12pt",
                lineHeight: "1.2",
                color: "#000000",
                paddingTop: "1in",
                paddingBottom: "1in",
                marginLeft: "1.5in",
                marginRight: "1in",
                paddingLeft: "0",
                paddingRight: "0",
                overflowX: "visible",
                overflowY: "visible",
              }}
            >
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="outline-none min-h-[400px]"
                    style={{
                      fontFamily: 'Courier, "Courier New", monospace',
                      fontSize: "12pt",
                      lineHeight: "1.2",
                      color: "#000000",
                      padding: "0",
                      margin: "0",
                    }}
                  />
                }
                placeholder={
                  <div
                    className="absolute text-gray-400 pointer-events-none"
                    style={{
                      fontFamily: 'Courier, "Courier New", monospace',
                      fontSize: "12pt",
                      top: "1in",
                    }}
                  >
                    Start typing...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <UppercasePlugin />
              <EnterKeyPlugin />
              <OnChangePlugin onChange={onChange} />
            </div>
          </PageWrapper>
        </div>
      </LexicalComposer>
    </FormatProvider>
  );
}
