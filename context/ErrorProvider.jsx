"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const ErrorContext = createContext({
  errorMsg: "",
  setError: (msg) => {},
});

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [errorMsg, setError] = useState("");
  const router = useRouter();

  const handleTryAgain = () => {
    setError("");      
    // replace not push ...     
    router.replace("/login"); 
  };

  return (
    <ErrorContext.Provider value={{ errorMsg, setError }}>
      {children}

      {errorMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-6 py-4 rounded shadow-lg z-50 flex flex-col items-center gap-2 w-[90%] max-w-sm text-center">
          <p className="text-sm">{errorMsg}</p>
          <button
            type="button"
            onClick={handleTryAgain}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}
    </ErrorContext.Provider>
  );
};
