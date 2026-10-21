"use client";

// Last-resort boundary for errors in the root layout itself. It replaces the whole
// document, so it cannot rely on the app's providers, fonts or stylesheet.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f0e3", color: "#2b261f" }}>
        <main role="alert" style={{ maxWidth: 480, margin: "0 auto", padding: "96px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 600 }}>Something went wrong · حدث خطأ غير متوقع</h1>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, minHeight: 44, padding: "0 20px", border: 0, borderRadius: 8, background: "#4d5a2c", color: "#fffdf8", fontSize: 16, cursor: "pointer" }}
          >
            Try again · حاول مرة أخرى
          </button>
        </main>
      </body>
    </html>
  );
}
