"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useDarkMode } from "@/app/DarkModeContext";

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "darkModeToggle_position";
const DEFAULT_POSITION: Position = { x: 0, y: 0 }; // bottom-right by default

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [mounted, setMounted] = useState(false);

  // Load position from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedPosition = localStorage.getItem(STORAGE_KEY);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch {
        // Set default position to bottom-right
        const defaultX = window.innerWidth - 80;
        const defaultY = window.innerHeight - 80;
        setPosition({ x: defaultX, y: defaultY });
      }
    } else {
      // Set default position to bottom-right
      const defaultX = window.innerWidth - 80;
      const defaultY = window.innerHeight - 80;
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Save position to localStorage when drag ends
  const handleDragEnd = (event: any, info: any) => {
    const newPosition = {
      x: info.x,
      y: info.y,
    };
    setPosition(newPosition);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
  };

  // Calculate drag constraints based on viewport size
  const getConstraints = () => {
    if (!mounted) return { top: 0, left: 0, right: 0, bottom: 0 };
    return {
      top: 0,
      left: 0,
      right: window.innerWidth - 56, // 56px = button width (w-14 = 3.5rem)
      bottom: window.innerHeight - 56, // 56px = button height
    };
  };

  if (!mounted) return null;

  return (
    <motion.div
      drag
      dragConstraints={getConstraints()}
      dragElastic={0.5}
      dragMomentum={true}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      layout
      initial={{ x: position.x, y: position.y }}
      animate={{ x: position.x, y: position.y }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.2, rotate: 10 }}
      className="fixed z-9999 w-14 h-14 group"
      style={{
        touchAction: "none",
      }}
    >
      <motion.button
        onTap={toggleDarkMode}
        whileHover={{ scale: 1.1 }}
        whileDrag={{ scale: 0.95, cursor: "grabbing" }}
        whileTap={{ scale: 0.9 }}
        className="w-full h-full flex items-center justify-center rounded-full backdrop-blur-md bg-white/30 dark:bg-slate-800/40 border border-white/50 dark:border-slate-700/50 shadow-2xl transition-all duration-300 hover:bg-white/40 dark:hover:bg-slate-700/50"
        style={{ cursor: "grab" }}
        title={isDarkMode ? "Click to switch to Light Mode, drag to move" : "Click to switch to Dark Mode, drag to move"}
        aria-label="Toggle Dark Mode"
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDarkMode ? 360 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-amber-400" />
          ) : (
            <Moon className="w-6 h-6 text-slate-700" />
          )}
        </motion.div>
      </motion.button>

      {/* Tooltip on Hover */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg whitespace-nowrap pointer-events-none"
      >
        Drag me!
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-slate-700" />
      </motion.div>
    </motion.div>
  );
}
