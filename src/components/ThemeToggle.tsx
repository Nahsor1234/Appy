"use client";

import { Palette, Zap, Waves, Ghost, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import { useMemo } from "react";

type Theme = "teal" | "emerald" | "ocean" | "obsidian" | "immersive";

const THEME_COLORS: Record<Theme, string> = {
  teal: '#2a7c6f',
  ocean: '#0a4d5c',
  emerald: '#052310',
  obsidian: '#3c3c48',
  immersive: '#000000'
};

interface ThemeToggleProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const ThemeToggle = ({ currentTheme, onThemeChange }: ThemeToggleProps) => {
  const { feedback } = useVibeFeedback();

  const themes: Theme[] = ["teal", "emerald", "ocean", "obsidian", "immersive"];
  const nextTheme = useMemo(() => {
    const currentIndex = themes.indexOf(currentTheme as Theme);
    return themes[(currentIndex + 1) % themes.length];
  }, [currentTheme]);

  const toggleTheme = () => {
    feedback('toggle');
    onThemeChange(nextTheme);
    localStorage.setItem("pulsyvibe_theme", nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);

    const meta = document.getElementById('system-theme-color') || document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[nextTheme]);
    }
  };

  const getIcon = () => {
    switch (currentTheme) {
      case "emerald": return <Zap className="w-5 h-5 text-accent" />;
      case "ocean": return <Waves className="w-5 h-5 text-accent" />;
      case "obsidian": return <Ghost className="w-5 h-5 text-accent" />;
      case "immersive": return <Music className="w-5 h-5 text-accent" />;
      default: return <Palette className="w-5 h-5 text-accent" />;
    }
  };

  const getLabel = () => {
    switch (currentTheme) {
      case "teal": return "Light Teal";
      case "emerald": return "Emerald Deep";
      case "ocean": return "Ocean High";
      case "obsidian": return "Obsidian Dark";
      case "immersive": return "Immersive";
      default: return "Theme";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => feedback('hover')}
      onClick={toggleTheme}
      className="glass h-12 px-5 rounded-full flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTheme}
          initial={{ y: 15, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -15, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2"
        >
          {getIcon()}
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">
            {getLabel()}
          </span>
          {/* Next theme preview dot */}
          <div
            className="w-2 h-2 rounded-full opacity-60 ml-1"
            style={{ backgroundColor: THEME_COLORS[nextTheme] }}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};
