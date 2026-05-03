"use client";

import { useEffect, useRef } from "react";
import styles from "./QuillEditor.module.css";

interface QuillEditorProps {
  initialContent: string;
  placeholder?: string;
  onUpdate: (html: string) => void;
  className?: string;
  isNepali?: boolean;
  /**
   * When this number increments, the editor's content is replaced with
   * the latest `initialContent`. Used by features like AI translation
   * that need to push new HTML into an already-mounted editor.
   */
  contentVersion?: number;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] as (number | boolean)[] }],
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

export default function QuillEditor({
  initialContent,
  placeholder,
  onUpdate,
  className,
  isNepali,
  contentVersion,
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const initialContentRef = useRef(initialContent);
  const quillRef = useRef<unknown>(null);
  const lastVersionRef = useRef<number | undefined>(contentVersion);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    initialContentRef.current = initialContent;
  }, [initialContent]);

  useEffect(() => {
    if (isInitialized.current || !containerRef.current) return;
    isInitialized.current = true;

    import("quill").then(({ default: Quill }) => {
      if (!containerRef.current) return;

      const q = new Quill(containerRef.current, {
        theme: "snow",
        placeholder: placeholder ?? "Write here…",
        modules: { toolbar: TOOLBAR_OPTIONS },
      });
      quillRef.current = q;

      if (initialContentRef.current) {
        q.root.innerHTML = initialContentRef.current;
      }

      q.on("text-change" as Parameters<typeof q.on>[0], () => {
        const html = q.root.innerHTML;
        onUpdateRef.current(html === "<p><br></p>" ? "" : html);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (contentVersion === undefined) return;
    if (lastVersionRef.current === contentVersion) return;
    lastVersionRef.current = contentVersion;
    const q = quillRef.current as { root: HTMLElement } | null;
    if (!q) return;
    q.root.innerHTML = initialContent || "";
    onUpdateRef.current(initialContent || "");
  }, [contentVersion, initialContent]);

  return (
    <div
      className={[
        styles.wrapper,
        isNepali ? styles.devanagari : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div ref={containerRef} />
    </div>
  );
}
