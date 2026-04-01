export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        gap: "1.5rem",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Welcome to Next.js 16
      </h1>
      <p style={{ fontSize: "1.125rem", color: "#6b7280", textAlign: "center" }}>
        Get started by editing{" "}
        <code
          style={{
            fontFamily: "monospace",
            backgroundColor: "#f3f4f6",
            padding: "0.2rem 0.4rem",
            borderRadius: "0.25rem",
          }}
        >
          app/page.tsx
        </code>
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "1rem",
        }}
      >
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#000",
            color: "#fff",
            borderRadius: "0.5rem",
            fontWeight: "600",
          }}
        >
          Docs
        </a>
        <a
          href="https://nextjs.org/learn"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.75rem 1.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            fontWeight: "600",
          }}
        >
          Learn
        </a>
      </div>
    </main>
  );
}
