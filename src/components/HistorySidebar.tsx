"use client";

import { useState } from "react";
import { History, Trash2, Globe, Hash, Clock, PlayCircle } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type VibeTrack = {
  videoId: string;
  title: string;
  artist: string;
  hue: number;
  vibe?: string;
};

export type HistoryItem = {
  id: string;
  query: string;
  vibeLabel: string;
  djMessage?: string;
  region: string;
  playlist: VibeTrack[];
  timestamp: number;
  totalTracks: number;
};

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistorySidebar = ({ history, onSelect, onClear }: HistorySidebarProps) => {
  const { feedback } = useVibeFeedback();
  const [open, setOpen] = useState(false);

  const handleSelect = (item: HistoryItem) => {
    feedback('success');
    setOpen(false);
    setTimeout(() => {
      onSelect(item);
    }, 200);
  };

  const handleOpen = () => {
    feedback('toggle');
    setOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={(val) => {
      if (!val) feedback('toggle');
      setOpen(val);
    }}>
      <SheetTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => feedback('hover')}
          onClick={handleOpen}
          className="glass h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <History className="w-5 h-5 text-primary group-hover:rotate-[-15deg] transition-transform" />
        </motion.button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="glass-bento border-r border-white/10 w-[280px] p-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Vibe Vault</SheetTitle>
              <span className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Historical Syncs</span>
            </div>
            
            {history.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.1, color: "#ef4444" }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  feedback('error');
                  onClear();
                }}
                className="p-2 rounded-xl bg-white/5 text-muted-foreground/40 hover:text-red-500 transition-colors"
                title="Purge Archive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-3 py-6">
            <AnimatePresence mode="popLayout">
              {history.length === 0 ? (
                <div className="text-center py-32 px-4 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-dashed border-white/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-white/5" />
                  </div>
                  <p className="text-[8px] font-black text-muted-foreground/10 uppercase tracking-[0.4em]">Vault Empty</p>
                </div>
              ) : (
                history.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                    onMouseEnter={() => feedback('hover')}
                    onClick={() => handleSelect(item)}
                    className="group w-full glass p-4 rounded-[24px] flex flex-col gap-3 text-left hover:border-primary/40 transition-all relative overflow-hidden active:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-black text-white group-hover:text-primary transition-colors capitalize truncate block tracking-tight">
                          {item.query}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest">{item.vibeLabel}</span>
                        </div>
                      </div>
                      <div className="shrink-0 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20 flex items-center gap-1">
                        <PlayCircle className="w-2.5 h-2.5 text-primary" />
                        <span className="text-[9px] font-black text-primary">{item.totalTracks}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <Globe className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest truncate max-w-[80px]">
                          {item.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-20">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-center">
          <p className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-[0.4em]">
            PulsyVibe persistent memory
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};