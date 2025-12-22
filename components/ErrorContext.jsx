"use client";

import { createContext, useContext, useState } from "react";

interface ErrorContextType {
  setError: (err: Error) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  setError: () => {},
});

export const useError = () => useContext(ErrorContext);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  return (
    <ErrorContext.Provider value={{ setError }}>
      {error && <ErrorBoundaryThrower error={error} />}
      {children}
    </ErrorContext.Provider>
  );
};

// Component يقوم برمي الخطأ أثناء render ليتم التقاطه بواسطة ErrorBoundary
const ErrorBoundaryThrower = ({ error }: { error: Error }) => {
  throw error;
};
