
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Music2, Terminal, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  logs?: string[];
}

export const LoadingOverlay = ({ isVisible, message = "Crafting your vibe...", logs = [] }: LoadingOverlayProps) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 max-w-lg w-full px-6"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.1, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
              />
              
              <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-primary/30"
                />
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                  <Music2 className="text-primary w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <motion.h2 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl font-black text-foreground uppercase tracking-tight"
              >
                {message}
              </motion.h2>
              <p className="text-muted-foreground text-[8px] font-black uppercase tracking-[0.4em] opacity-40">
                PulsyVibe Trinity System
              </p>
            </div>

            {/* Vibe Sync Console */}
            <div className="w-full h-48 bg-black/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
              <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2">
                <Terminal size={12} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Sync Console</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1 scrollbar-hide">
                {logs.length === 0 ? (
                  <div className="flex items-center gap-2 text-muted-foreground/30 italic">
                    <ChevronRight size={10} />
                    <span>Waiting for system handshake...</span>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-white/70"
                    >
                      <span className="text-primary shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span className="flex-1 leading-relaxed">{log}</span>
                    </motion.div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            <div className="w-full h-[1px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
