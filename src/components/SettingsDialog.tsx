"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Palette, Database, Zap, HardDrive, RefreshCcw, XCircle, Volume2, VolumeX, Headphones, MonitorPlay, ChevronRight, ZapIcon, Ghost, Moon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AboutDialog } from "@/components/AboutDialog";

interface SettingsDialogProps {
  dynamicColors: boolean;
  setDynamicColors: (val: boolean) => void;
  downloadMethod: 'organic' | 'syncx' | 'faces100';
  setDownloadMethod: (val: 'organic' | 'syncx' | 'faces100') => void;
  cacheName: string;
  onReset: () => void;
  apiKey: string | null;
  onUpdateKey: (key: string) => void;
  playbackMode: 'audio' | 'video';
  setPlaybackMode: (mode: 'audio' | 'video') => void;
}

interface SettingsItemProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

const SettingsItem = ({ icon: Icon, title, subtitle, children, className }: SettingsItemProps) => (
  <div className={cn("flex items-center justify-between p-4 min-h-[64px] rounded-2xl hover:bg-white/[0.03] transition-colors", className)}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black text-foreground">{title}</span>
        {subtitle && <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">{subtitle}</span>}
      </div>
    </div>
    <div className="flex items-center shrink-0">
      {children}
    </div>
  </div>
);

export const SettingsDialog = ({ 
  dynamicColors, 
  setDynamicColors, 
  downloadMethod,
  setDownloadMethod,
  cacheName,
  onReset,
  apiKey,
  onUpdateKey,
  playbackMode,
  setPlaybackMode
}: SettingsDialogProps) => {
  const { feedback, triggerHaptic, isEnabled: feedbackEnabled, toggleFeedback } = useVibeFeedback();
  const { toast } = useToast();
  const [cacheCount, setCacheCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState<string>("0 KB");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStorageMetrics = useCallback(async () => {
    if (typeof window === 'undefined') return;
    setIsUpdating(true);

    try {
      let totalBytes = 0;
      const keys = [
        "pulsyvibe_sync_v28", 
        "pulsyvibe_id_lock_v2", 
        "pulsyvibe_theme", 
        "pulsyvibe_google_ai_key",
        "pulsyvibe_feedback_enabled",
        "pulsyvibe_playback_mode",
        "pulsyvibe_download_method"
      ];
      
      keys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) totalBytes += (key.length + val.length) * 2;
      });

      const savedHistory = localStorage.getItem("pulsyvibe_sync_v28");
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            const totalSongs = parsed.reduce((acc, item) => acc + (item.playlist?.length || 0), 0);
            setCacheCount(totalSongs);
          }
        } catch (e) {}
      }

      if (totalBytes < 1024) setStorageUsage(`${totalBytes} B`);
      else if (totalBytes < 1048576) setStorageUsage(`${(totalBytes / 1024).toFixed(1)} KB`);
      else setStorageUsage(`${(totalBytes / 1048576).toFixed(1)} MB`);
    } catch (e) {}
    finally {
      setTimeout(() => setIsUpdating(false), 400);
    }
  }, []);

  useEffect(() => {
    updateStorageMetrics();
  }, [updateStorageMetrics]);

  const handleResetAppStorage = async () => {
    try {
      localStorage.clear();
      onReset();
      setCacheCount(0);
      await updateStorageMetrics();
      toast({ 
        title: "App Reset Complete", 
        description: "All local storage and cache data has been purged.",
      });
      setIsResetDialogOpen(false);
      feedback('success');
    } catch (e) {}
  };

  const engines = [
    { id: 'organic', name: 'Pulse Core ⚡', icon: ZapIcon, desc: 'Primary High-Res' },
    { id: 'syncx', name: 'Shadow Fetch 🌑', icon: Moon, desc: 'Exploration Discovery' },
    { id: 'faces100', name: 'Phantom Link 👻', icon: Ghost, desc: 'Alternative Phantom' }
  ] as const;

  return (
    <Dialog onOpenChange={(open) => open && updateStorageMetrics()}>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => feedback('toggle')}
          className="glass h-12 w-12 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Settings className="w-5 h-5 text-primary" />
        </motion.button>
      </DialogTrigger>
      
      <DialogContent className="glass-bento border-white/10 w-[min(94vw,400px)] p-6 rounded-[40px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-black tracking-tight text-foreground uppercase">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 px-4 mb-2">Experience</h4>
          
          <SettingsItem 
            icon={Palette} 
            title="Dynamic Colors" 
            subtitle="Tint cards based on thumbnails"
          >
            <Switch 
              checked={dynamicColors} 
              onCheckedChange={(val) => {
                setDynamicColors(val);
                feedback('toggle');
              }}
            />
          </SettingsItem>

          <SettingsItem 
            icon={playbackMode === 'audio' ? Headphones : MonitorPlay} 
            title="Minimal Focus" 
            subtitle={playbackMode === 'audio' ? "Artwork Focus (Video Hidden)" : "Cinematic Video Mode"}
          >
            <Switch 
              checked={playbackMode === 'audio'} 
              onCheckedChange={(val) => {
                setPlaybackMode(val ? 'audio' : 'video');
                triggerHaptic('medium');
              }}
            />
          </SettingsItem>

          <SettingsItem 
            icon={feedbackEnabled ? Volume2 : VolumeX} 
            title="Feedback Loops" 
            subtitle="Haptics & Sound Effects"
          >
            <Switch 
              checked={feedbackEnabled} 
              onCheckedChange={toggleFeedback}
            />
          </SettingsItem>

          <div className="h-px bg-white/5 my-4 mx-4" />
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 px-4 mb-2">Download Engine</h4>
          
          <div className="grid grid-cols-1 gap-2 px-4 mb-4">
            {engines.map((engine) => (
              <button
                key={engine.id}
                onClick={() => {
                  setDownloadMethod(engine.id);
                  feedback('click');
                }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                  downloadMethod === engine.id 
                    ? "bg-primary/10 border-primary shadow-[0_0_15px_hsl(var(--primary)/0.1)]" 
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center border",
                    downloadMethod === engine.id ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/10"
                  )}>
                    <engine.icon size={14} className={downloadMethod === engine.id ? "text-primary" : "text-muted-foreground/40"} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={cn("text-[10px] font-black uppercase tracking-wider", downloadMethod === engine.id ? "text-primary" : "text-white/60")}>
                      {engine.name}
                    </span>
                    <span className="text-[8px] font-bold text-muted-foreground/40 uppercase">{engine.desc}</span>
                  </div>
                </div>
                {downloadMethod === engine.id && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
              </button>
            ))}
          </div>

          <div className="h-px bg-white/5 my-4 mx-4" />
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 px-4 mb-2">Systems</h4>

          <SettingsItem 
            icon={Zap} 
            title="Google AI Access" 
            subtitle={apiKey ? "Status: Authenticated ✓" : "Status: Disconnected"}
          >
            {apiKey && (
              <button 
                onClick={() => {
                  localStorage.removeItem("pulsyvibe_google_ai_key");
                  window.location.reload();
                }}
                className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <XCircle size={14} />
              </button>
            )}
          </SettingsItem>

          <SettingsItem 
            icon={Database} 
            title="App History" 
            subtitle={`${cacheCount} unique songs stored`}
          >
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <button 
                  onClick={() => feedback('error')}
                  className="p-2.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 flex items-center justify-center"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-bento border-white/10 rounded-[32px] max-w-[90vw] sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-foreground uppercase tracking-tight">Erase All Data?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground font-medium">
                    This will permanently clear your history, preferences, and saved API key. You will need to re-enter your Google AI key after reset. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-3">
                  <AlertDialogCancel className="rounded-full font-black uppercase tracking-widest text-[10px] border-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetAppStorage}
                    className="rounded-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px]"
                  >
                    Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SettingsItem>

          <div className="px-4 py-2 mt-2 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Local Storage</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{storageUsage}</span>
          </div>

          <div className="h-px bg-white/5 my-4 mx-4" />

          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 px-4 mb-2">Info</h4>
          <AboutDialog />
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.3em]">
            PulsyVibe v2.8 • Optimized Experience
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
