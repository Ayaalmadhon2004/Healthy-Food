"use client";

import type { ComponentType, ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

interface FallbackWithMessageProps extends FallbackProps {
  message?: string;
}

// 1️⃣ Default Fallback Component
function DefaultFallback({ error, resetErrorBoundary, message }: FallbackWithMessageProps) {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h2> {message || "Something went wrong!"}</h2>
      <p>{error instanceof Error ? error.message : String(error)}</p>
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
}: {
  children: ReactNode;
  fallbackComponent?: ComponentType<FallbackWithMessageProps>;
  message?: string;
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
