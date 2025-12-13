"use client";

import { SelectionChangePlugin } from "./SelectionChangePlugin";
import { useFormat } from "@/contexts/FormatContext";
import { useFormatBlock } from "@/hooks/useFormatBlock";

export default function ScreenwritingToolbar() {
  const { activeFormat } = useFormat();
  const { formatBlock } = useFormatBlock();

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

        <button
          className={`screenwriting-nav-btn ${
            activeFormat === "shot" ? "active" : ""
          }`}
          onClick={() => formatBlock("shot")}
        >
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
