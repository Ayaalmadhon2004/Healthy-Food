"use client";

import type { ComponentType, ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useLanguage } from "@/context/LanguageContext";

interface FallbackWithMessageProps extends FallbackProps {
  message?: string;
}

function DefaultFallback({ error, resetErrorBoundary, message }: FallbackWithMessageProps) {
  const { lang } = useLanguage();
  return (
    <div role="alert" className="surface p-6 text-center">
      <p className="text-lg font-semibold text-ink">
        {message || (lang === "ar" ? "حدث خطأ ما" : "Something went wrong")}
      </p>
      <p className="mt-2 text-sm text-ink-soft">{error instanceof Error ? error.message : String(error)}</p>
      <button type="button" className="btn btn-clay mt-4" onClick={resetErrorBoundary}>
        {lang === "ar" ? "حاول مرة أخرى" : "Try again"}
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
