"use client";

import { Youtube, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ExportFABProps {
  onClick: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isVisible: boolean;
  isPlayerActive?: boolean;
}

export const ExportFAB = ({ onClick, isLoading, isSuccess, isVisible, isPlayerActive }: ExportFABProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 100 }}
          className={cn(
            "fixed right-6 z-[100] transition-all duration-500 ease-in-out",
            isPlayerActive ? "bottom-[5.75rem]" : "bottom-6"
          )}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            disabled={isLoading || isSuccess}
            className={cn(
              "h-11 px-5 rounded-full shadow-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all",
              isSuccess 
                ? 'bg-green-500 text-white cursor-default' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 btn-glow-primary'
            )}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <Youtube className="h-4 w-4" />
            )}
            <span className="font-black">{isSuccess ? 'Synced!' : isLoading ? 'Syncing...' : 'Save on YT Music'}</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
