"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("darkMode");
    const initialMode = savedMode === "true";
    setIsDarkMode(initialMode);
    document.documentElement.classList.toggle("dark", initialMode);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    console.log("Mode changed to:", isDarkMode);
  }, [isDarkMode, mounted]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextState = !prev;
      localStorage.setItem("darkMode", String(nextState));
      document.documentElement.classList.toggle("dark", nextState);
      return nextState;
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
}
