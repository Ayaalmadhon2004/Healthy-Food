"use client";

import { ErrorBoundary } from "react-error-boundary";

// 1️⃣ Default Fallback Component
function DefaultFallback({ error, resetErrorBoundary, message }) {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2> {message || "Something went wrong!"}</h2>
      <p>{error.message}</p>
      <button
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          backgroundColor: "#ff6347",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
        onClick={resetErrorBoundary}
      >
        Try Again
      </button>
    </div>
  );
}

export default function ErrorBoundaryWrapper({
  children,
  fallbackComponent: Fallback = DefaultFallback,
  message,
}) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => <Fallback {...props} message={message} />}
      onError={(error, info) => {
        console.error("ErrorBoundary caught an error:", error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
