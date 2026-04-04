"use client";

import { memo } from "react";
import { motion } from "framer-motion";

/**
 * @fileOverview High-performance, theme-reactive cinematic background.
 * Optimized for zero visual noise with deep radial atmospheric gradients.
 */

interface VibeBackgroundProps {
  activeHue?: number | null;
  isPlaying?: boolean;
  currentTheme?: string;
}

export const VibeBackground = memo(({ activeHue, isPlaying, currentTheme }: VibeBackgroundProps) => {
  return (
    <div className="fixed inset-0 -z-10 bg-background overflow-hidden pointer-events-none transform-gpu">

      {/* Primary color bloom — top left */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full transform-gpu"
        style={{
          background: activeHue != null
            ? `radial-gradient(circle, hsla(${activeHue}, 70%, 45%, 0.35) 0%, transparent 70%)`
            : `radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)`,
          transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'blur(40px)',
        }}
      />

      {/* Secondary accent bloom — bottom right, complementary hue */}
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full transform-gpu"
        style={{
          background: activeHue != null
            ? `radial-gradient(circle, hsla(${(activeHue + 40) % 360}, 60%, 35%, 0.25) 0%, transparent 70%)`
            : `radial-gradient(circle, hsl(var(--accent) / 0.15) 0%, transparent 70%)`,
          transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'blur(60px)',
        }}
      />

      {/* Center soft glow — scales when playing */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full transform-gpu"
        animate={{ scale: isPlaying ? 1.3 : 1.1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          background: activeHue != null
            ? `radial-gradient(circle, hsla(${activeHue}, 50%, 30%, 0.12) 0%, transparent 80%)`
            : `radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 80%)`,
          transition: 'background 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Deep vignette — keeps text readable regardless of color */}
      <div
        className="absolute inset-0 transform-gpu"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.6) 70%, hsl(var(--background)) 100%)`,
        }}
      />
    </div>
  );
});

VibeBackground.displayName = "VibeBackground";
