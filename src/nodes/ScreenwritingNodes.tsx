import {
  $applyNodeReplacement,
  $createParagraphNode,
  DecoratorNode,
  EditorConfig,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  SerializedLexicalNode,
  SerializedParagraphNode,
  Spread,
} from "lexical";
import { ReactNode } from "react";

export type ScreenwritingElementType =
  | "scene-heading"
  | "action"
  | "character"
  | "dialogue"
  | "shot"
  | "parenthetical"
  | "transition";

export class SceneHeadingNode extends ParagraphNode {
  static getType(): string {
    return "scene-heading";
  }

  static clone(node: SceneHeadingNode): SceneHeadingNode {
    return new SceneHeadingNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-4";
    element.style.fontWeight = "bold";
    element.style.textTransform = "uppercase";
    element.style.marginLeft = "0";
    element.style.marginRight = "0";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: SceneHeadingNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): SceneHeadingNode {
    const node = $createSceneHeadingNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createSceneHeadingNode(): SceneHeadingNode {
  return $applyNodeReplacement(new SceneHeadingNode());
}

export class ActionNode extends ParagraphNode {
  static getType(): string {
    return "action";
  }

  static clone(node: ActionNode): ActionNode {
    return new ActionNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-4";
    element.style.marginLeft = "0";
    element.style.marginRight = "0";
    element.style.paddingLeft = "0";
    element.style.paddingRight = "0";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: ActionNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): ActionNode {
    const node = $createActionNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createActionNode(): ActionNode {
  return $applyNodeReplacement(new ActionNode());
}

export class CharacterNode extends ParagraphNode {
  static getType(): string {
    return "character";
  }

  static clone(node: CharacterNode): CharacterNode {
    return new CharacterNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "1 mt-4";
    element.style.textTransform = "uppercase";
    element.style.marginLeft = "2.2in";
    element.style.marginRight = "0";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: CharacterNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): CharacterNode {
    const node = $createCharacterNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createCharacterNode(): CharacterNode {
  return $applyNodeReplacement(new CharacterNode());
}

export class DialogueNode extends ParagraphNode {
  static getType(): string {
    return "dialogue";
  }

  static clone(node: DialogueNode): DialogueNode {
    return new DialogueNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-4";
    // Dialogue is 1 inch from the pre-existing 1.5" margin = 2.5" total from page left
    element.style.marginLeft = "1in";
    element.style.marginRight = "2in";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: DialogueNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): DialogueNode {
    const node = $createDialogueNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createDialogueNode(): DialogueNode {
  return $applyNodeReplacement(new DialogueNode());
}

export class ParentheticalNode extends ParagraphNode {
  static getType(): string {
    return "parenthetical";
  }

  static clone(node: ParentheticalNode): ParentheticalNode {
    return new ParentheticalNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-1";
    // 3 inches total from page left = 1.5" (page margin) + 1.5" additional
    element.style.marginLeft = "1.5in";
    element.style.marginRight = "0";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: ParentheticalNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(
    serializedNode: SerializedParagraphNode
  ): ParentheticalNode {
    const node = $createParentheticalNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createParentheticalNode(): ParentheticalNode {
  return $applyNodeReplacement(new ParentheticalNode());
}

export class TransitionNode extends ParagraphNode {
  static getType(): string {
    return "transition";
  }

  static clone(node: TransitionNode): TransitionNode {
    return new TransitionNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-4 ";
    element.style.textTransform = "uppercase";
    element.style.textAlign = "right";
    // Start at right margin (1" from page right = 7.5" from page left)
    // Content area is 6" wide (from 1.5" to 7.5" from page left)
    // Transition spans full content width, right-aligned, wraps when reaching left margin
    element.style.marginLeft = "0";
    element.style.marginRight = "0";
    element.style.paddingLeft = "0";
    element.style.paddingRight = "0";
    element.style.width = "100%"; // Use full width of content area
    element.style.maxWidth = "100%";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: TransitionNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): TransitionNode {
    const node = $createTransitionNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createTransitionNode(): TransitionNode {
  return $applyNodeReplacement(new TransitionNode());
}

export class PageBreakSpacerNode extends ParagraphNode {
  __offsetSpacing: number;

  constructor(key?: NodeKey, offsetSpacing: number = 0) {
    super(key);
    this.__offsetSpacing = offsetSpacing;
  }

  static getType(): string {
    return "page-break-spacer";
  }

  static clone(node: PageBreakSpacerNode): PageBreakSpacerNode {
    return new PageBreakSpacerNode(node.__key, node.__offsetSpacing);
  }

  getOffsetSpacing(): number {
    return this.__offsetSpacing;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    // 96px bottom margin + 96px top margin + 40px spacing = 232px total
    // Add offsetSpacing to adjust height
    const totalHeight = 232 + this.__offsetSpacing;
    element.style.height = `${totalHeight}px`;
    element.style.margin = "0";
    element.style.padding = "0";
    element.style.border = "none";
    element.style.outline = "none";
    element.style.pointerEvents = "none";
    element.style.userSelect = "none";
    element.setAttribute("contenteditable", "false");
    return element;
  }

  updateDOM(prevNode: PageBreakSpacerNode, dom: HTMLElement): boolean {
    // Update height if offsetSpacing changed
    if (prevNode.__offsetSpacing !== this.__offsetSpacing) {
      const totalHeight = 232 + this.__offsetSpacing;
      dom.style.height = `${totalHeight}px`;
      return true;
    }
    return false;
  }

  static importJSON(
    serializedNode: SerializedParagraphNode
  ): PageBreakSpacerNode {
    const node = $createPageBreakSpacerNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  // Prevent selection and editing
  isInline(): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}

export function $createPageBreakSpacerNode(
  offsetSpacing: number = 0
): PageBreakSpacerNode {
  return $applyNodeReplacement(
    new PageBreakSpacerNode(undefined, offsetSpacing)
  );
}


export class ShotNode extends ParagraphNode {
  static getType(): string {
    return "shot";
  }

  static clone(node: ShotNode): ShotNode {
    return new ShotNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    element.className = "mb-4";
    element.style.marginLeft = "0";
    element.style.marginRight = "0";
    element.style.paddingLeft = "0";
    element.style.textTransform = "uppercase";
    element.style.paddingRight = "0";
    element.style.color = "#000000";
    return element;
  }

  updateDOM(prevNode: ShotNode, dom: HTMLElement): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedParagraphNode): ShotNode {
    const node = $createShotNode();
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }
}

export function $createShotNode(): ShotNode {
  return $applyNodeReplacement(new ShotNode());
}
