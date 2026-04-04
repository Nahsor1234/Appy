"use client";

import { motion } from "framer-motion";
import { useEffect, useState, memo } from "react";

interface OpeningScreenProps {
  onComplete: () => void;
}

export const OpeningScreen = memo(({ onComplete }: OpeningScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // The theme is handled globally via document attribute set in layout.tsx
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      const completeTimer = setTimeout(onComplete, 600);
      return () => clearTimeout(completeTimer);
    }, 2000);

    return () => clearTimeout(exitTimer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isExiting ? 0 : 1,
      }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut" 
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      <div className="absolute inset-0 cyber-mesh opacity-30" />
      
      <div className="relative z-10 flex flex-col items-center gap-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-9xl font-black tracking-tight text-white transform-gpu">
            PulsyVibe
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-8 text-primary opacity-60">
            Organic Sonic Curation
          </p>
        </motion.div>

        <div className="w-48 h-[1px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 1.7, ease: "easeInOut" }}
            className="w-full h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]"
          />
        </div>
      </div>
    </motion.div>
  );
});

OpeningScreen.displayName = "OpeningScreen";
