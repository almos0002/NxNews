"use client";

import { useEffect, useRef } from "react";
import styles from "./QuillEditor.module.css";

interface QuillEditorProps {
  initialContent: string;
  placeholder?: string;
  onUpdate: (html: string) => void;
  className?: string;
  isNepali?: boolean;
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
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const onUpdateRef = useRef(onUpdate);
  const initialContentRef = useRef(initialContent);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

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
