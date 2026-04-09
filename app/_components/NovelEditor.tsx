"use client";

import { useRef, useState } from "react";
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorBubble,
  EditorBubbleItem,
  type JSONContent,
  type SuggestionItem,
  Placeholder,
  HighlightExtension,
  HorizontalRule,
  Command,
  createSuggestionItems,
  handleCommandNavigation,
  renderItems,
  TiptapUnderline,
  StarterKit,
} from "novel";
import styles from "./NovelEditor.module.css";

/* ── Helpers ────────────────────────────────── */
function textToJson(text: string): JSONContent {
  if (!text?.trim()) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  if (text.startsWith('{"type":"doc"')) {
    try { return JSON.parse(text); } catch {}
  }
  // Plain text — split into paragraphs
  return {
    type: "doc",
    content: text
      .split(/\n+/)
      .filter(Boolean)
      .map((para) => ({
        type: "paragraph",
        content: [{ type: "text", text: para }],
      })),
  };
}

/* ── Slash command items ─────────────────────── */
const suggestionItems: SuggestionItem[] = createSuggestionItems([
  {
    title: "Heading 1",
    description: "Large section title",
    searchTerms: ["h1", "heading", "big"],
    icon: <span className={styles.cmdIcon}>H1</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium sub-heading",
    searchTerms: ["h2", "heading", "medium"],
    icon: <span className={styles.cmdIcon}>H2</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small sub-heading",
    searchTerms: ["h3", "heading", "small"],
    icon: <span className={styles.cmdIcon}>H3</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list",
    searchTerms: ["ul", "list", "bullet", "unordered"],
    icon: <span className={styles.cmdIcon}>•</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    searchTerms: ["ol", "list", "number", "ordered"],
    icon: <span className={styles.cmdIcon}>1.</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Blockquote",
    description: "Pull quote or citation",
    searchTerms: ["quote", "blockquote", "cite"],
    icon: <span className={styles.cmdIcon}>&ldquo;</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Code snippet",
    searchTerms: ["code", "pre", "block", "snippet"],
    icon: <span className={styles.cmdIcon}>{"`"}</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Horizontal rule",
    searchTerms: ["hr", "divider", "line", "rule"],
    icon: <span className={styles.cmdIcon}>—</span>,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
]);

/* ── Main component ─────────────────────────── */
interface NovelEditorProps {
  initialContent: string;
  placeholder?: string;
  onUpdate: (html: string) => void;
  className?: string;
  isNepali?: boolean;
}

export default function NovelEditor({
  initialContent,
  placeholder,
  onUpdate,
  className,
  isNepali,
}: NovelEditorProps) {
  const commandRef = useRef<HTMLDivElement>(null);

  const extensions = [
    StarterKit.configure({ horizontalRule: false }),
    HorizontalRule,
    HighlightExtension,
    TiptapUnderline,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === "heading") return "Heading…";
        return placeholder ?? "Write here… (type / for commands)";
      },
    }),
    Command.configure({
      suggestion: {
        items: ({ query }) =>
          suggestionItems.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.searchTerms?.some((t) =>
                t.toLowerCase().includes(query.toLowerCase())
              )
          ),
        render: () => renderItems(commandRef),
      },
    }),
  ];

  return (
    <EditorRoot>
      <EditorContent
        initialContent={textToJson(initialContent)}
        extensions={extensions}
        immediatelyRender={false}
        className={`${styles.editorContent} ${isNepali ? styles.devanagari : ""} ${className ?? ""}`}
        onUpdate={({ editor }) => {
          onUpdate(editor.getHTML());
        }}
      >
        {/* ── Slash command palette ── */}
        <EditorCommand ref={commandRef} className={styles.commandPalette}>
          <EditorCommandEmpty className={styles.commandEmpty}>
            No matching commands
          </EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={({ editor, range }) => item.command?.({ editor, range })}
                className={styles.commandItem}
              >
                <div className={styles.commandItemInner}>
                  <div className={styles.commandItemIconWrap}>{item.icon}</div>
                  <div>
                    <p className={styles.commandItemTitle}>{item.title}</p>
                    <p className={styles.commandItemDesc}>{item.description}</p>
                  </div>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>

        {/* ── Bubble formatting menu ── */}
        <EditorBubble className={styles.bubbleMenu}>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleBold().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel}><strong>B</strong></span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleItalic().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel}><em>I</em></span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleUnderline().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel} style={{ textDecoration: "underline" }}>U</span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleStrike().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel} style={{ textDecoration: "line-through" }}>S</span>
          </EditorBubbleItem>
          <div className={styles.bubbleDivider} />
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleHighlight().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel} style={{ background: "#fde68a", padding: "0 2px" }}>H</span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) => editor.chain().focus().toggleCode().run()}
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel} style={{ fontFamily: "monospace" }}>{"`"}</span>
          </EditorBubbleItem>
          <div className={styles.bubbleDivider} />
          <EditorBubbleItem
            onSelect={(editor) =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel}>H1</span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel}>H2</span>
          </EditorBubbleItem>
          <EditorBubbleItem
            onSelect={(editor) =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={styles.bubbleItem}
          >
            <span className={styles.bubbleLabel}>H3</span>
          </EditorBubbleItem>
        </EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
}
