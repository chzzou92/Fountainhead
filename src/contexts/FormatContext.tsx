"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type FormatType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition"
  | null;

interface FormatContextType {
  activeFormat: FormatType;
  setActiveFormat: (format: FormatType) => void;
}

const FormatContext = createContext<FormatContextType | undefined>(undefined);

export function FormatProvider({ children }: { children: ReactNode }) {
  // Default to "action" so one button is always highlighted
  const [activeFormat, setActiveFormat] = useState<FormatType>("action");

  return (
    <FormatContext.Provider value={{ activeFormat, setActiveFormat }}>
      {children}
    </FormatContext.Provider>
  );
}

export function useFormat() {
  const context = useContext(FormatContext);
  if (context === undefined) {
    throw new Error("useFormat must be used within a FormatProvider");
  }
  return context;
}
