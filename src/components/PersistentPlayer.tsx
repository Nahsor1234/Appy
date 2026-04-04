"use client";

import { memo, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, Pause, Maximize, Minimize, Headphones, MonitorPlay, ExternalLink, Disc } from "lucide-react";
import { type TrackInfo } from "@/app/actions/youtube";
import { UserProfile } from "@/lib/user-profile";
import { extractHueFromImage } from "@/lib/utils";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PersistentPlayerProps {
  activeTrack: TrackInfo | null;
  playbackMode: 'audio' | 'video';
  currentTheme?: string;
  onColorExtract?: (hue: number | null) => void;
}

export const PersistentPlayer = memo(({ activeTrack, playbackMode, currentTheme, onColorExtract }: PersistentPlayerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localHue, setLocalHue] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const [displayTrack, setDisplayTrack] = useState<TrackInfo | null>(activeTrack);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { feedback } = useVibeFeedback();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const trackStartTime = useRef<number>(0);

  const activeHue = useMemo(() => localHue !== null ? localHue : (displayTrack?.hue ?? 161), [displayTrack?.hue, localHue]);

  useEffect(() => {
    if (!activeTrack) {
      setDisplayTrack(null);
      setLocalHue(null);
      if (onColorExtract) onColorExtract(null);
      setHasStarted(false);
      return;
    }

    if (displayTrack && activeTrack.videoId !== displayTrack.videoId) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setDisplayTrack(activeTrack);
        setLocalHue(null);
        setIsTransitioning(false);
        setHasStarted(true);
        setIsPlaying(true);
        trackStartTime.current = Date.now();
        
        if (currentTheme === 'immersive') {
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
              extractHueFromImage(activeTrack.videoId).then(hue => {
                if (onColorExtract) onColorExtract(hue);
                setLocalHue(hue);
              });
            });
          } else {
            setTimeout(() => {
              extractHueFromImage(activeTrack.videoId).then(hue => {
                if (onColorExtract) onColorExtract(hue);
                setLocalHue(hue);
              });
            }, 200);
          }
        } else {
          if (onColorExtract) onColorExtract(null);
          setLocalHue(null);
        }
        
        localStorage.setItem('last_track_title', activeTrack.title);
        UserProfile.trackEvent('PLAY', activeTrack.title);
      }, 150); 
      
      return () => clearTimeout(timer);
    } else if (!displayTrack) {
      setDisplayTrack(activeTrack);
      setHasStarted(true);
      if (currentTheme === 'immersive') {
        extractHueFromImage(activeTrack.videoId).then(hue => {
          setLocalHue(hue);
          if (onColorExtract) onColorExtract(hue);
        });
      } else {
        if (onColorExtract) onColorExtract(null);
        setLocalHue(null);
      }
    } else if (currentTheme !== 'immersive') {
      // If track is same but theme changed away from immersive
      if (onColorExtract) onColorExtract(null);
      setLocalHue(null);
    } else if (currentTheme === 'immersive' && localHue === null) {
      // If track is same but theme changed to immersive
      extractHueFromImage(activeTrack.videoId).then(hue => {
        setLocalHue(hue);
        if (onColorExtract) onColorExtract(hue);
      });
    }
  }, [activeTrack, currentTheme, onColorExtract, displayTrack]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const togglePlay = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    const newState = !isPlaying;
    setIsPlaying(newState);
    feedback('play');

    if (iframeRef.current?.contentWindow) {
      const command = newState ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), '*');
    }
  }, [isPlaying, feedback]);

  const toggleFullscreen = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    feedback('click');
    const playerContainer = document.getElementById('pulsy-video-container');
    if (!playerContainer) return;
    try {
      if (!document.fullscreenElement) await playerContainer.requestFullscreen();
      else await document.exitFullscreen();
    } catch (err: any) {}
  }, [feedback]);

  const toggleExpand = useCallback(() => {
    feedback('toggle');
    setIsExpanded(prev => !prev);
  }, [feedback]);

  if (!displayTrack) return null;

  return (
    <>
      <div className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-0 right-0 z-[100] flex justify-center pointer-events-none px-6">
        <AnimatePresence mode="wait">
          {!isExpanded && (
            <motion.div
              key={displayTrack.videoId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: isTransitioning ? 0 : 1, 
                y: 0,
                transition: { type: "spring", stiffness: 400, damping: 30 }
              }}
              exit={{ opacity: 0, y: 15 }}
              onClick={toggleExpand}
              style={{
                borderColor: `hsla(${activeHue}, 70%, 55%, 0.2)`,
                boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px -5px hsla(${activeHue}, 80%, 40%, 0.2)`,
                willChange: 'transform, opacity, box-shadow'
              }}
              className="pointer-events-auto h-[60px] w-full max-w-[380px] rounded-full border bg-[#1a1a1a]/90 backdrop-blur-3xl flex items-center p-2 cursor-pointer group transform-gpu"
            >
              <div className="relative w-[42px] h-[42px] rounded-full overflow-hidden shrink-0 shadow-lg ring-2 ring-white/5">
                <Image src={`https://i.ytimg.com/vi/${displayTrack.videoId}/mqdefault.jpg`} alt="" fill className="object-cover" unoptimized />
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Disc size={20} className="text-primary/80" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 min-w-0 px-3 flex flex-col justify-center">
                <h4 className="text-[12px] font-black text-white truncate uppercase tracking-tight">
                  {displayTrack.title}
                </h4>
                <p 
                  className="text-[8px] font-black uppercase tracking-[0.3em] truncate mt-1 opacity-60" 
                  style={{ color: `hsla(${activeHue}, 80%, 80%, 1)` }}
                >
                  {displayTrack.artist}
                </p>
              </div>

              <div className="flex items-center gap-2 pr-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay} 
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/5 transition-colors"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={cn("fixed inset-0 z-[110] flex items-end justify-center transition-opacity duration-500", isExpanded ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")}>
        <div 
          onClick={toggleExpand} 
          className="absolute inset-0 bg-black/95 backdrop-blur-3xl" 
        />
        
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: isExpanded ? 0 : "100%" }} 
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          className="w-full max-w-2xl bg-[#121212]/98 border border-white/10 rounded-t-[3.5rem] sm:rounded-[4rem] shadow-[0_-20px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative z-10 mb-0 sm:mb-12 mx-0 sm:mx-6 transform-gpu will-change-transform"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0 opacity-[0.2] blur-[100px] transition-all duration-1000 scale-125"
              style={{ 
                background: `radial-gradient(circle at 50% 30%, hsla(${activeHue}, 80%, 50%, 0.8), transparent 70%)` 
              }}
            />
          </div>

          <div 
            id="pulsy-video-container" 
            className={cn(
              "w-full bg-black relative overflow-hidden border-b border-white/5",
              playbackMode === 'video' ? "aspect-video" : "h-0"
            )}
          >
            {hasStarted && (
              <iframe
                ref={iframeRef}
                key={displayTrack.videoId}
                src={`https://www.youtube.com/embed/${displayTrack.videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&fs=0${playbackMode === 'audio' ? '&vq=small' : ''}`}
                className="w-full h-full border-0 absolute inset-0 z-10"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              />
            )}
            <div className="absolute bottom-6 right-6 z-20">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen} 
                className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-2xl"
              >
                <Maximize size={20} />
              </motion.button>
            </div>
          </div>

          {playbackMode === 'audio' && (
            <div className="pt-16 pb-8 flex flex-col items-center gap-10">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[3.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
              >
                <Image src={`https://i.ytimg.com/vi/${displayTrack.videoId}/hqdefault.jpg`} alt="" fill className="object-cover scale-105" unoptimized />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                   <div 
                     className="w-24 h-24 rounded-full bg-white/5 border flex items-center justify-center"
                     style={{ borderColor: `hsla(${activeHue}, 80%, 60%, 0.3)` }}
                   >
                      <Headphones size={48} style={{ color: `hsla(${activeHue}, 90%, 75%, 1)` }} className="animate-pulse" />
                   </div>
                </div>
              </motion.div>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10">
                 <MonitorPlay size={14} className="text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Immersive Audio Sync</span>
              </div>
            </div>
          )}
          
          <div className="p-10 sm:p-14 flex flex-col gap-10 bg-[#121212]/98 backdrop-blur-3xl border-t border-white/5">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1 min-w-0">
                <motion.h3 
                  key={displayTrack.title}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter line-clamp-1 leading-tight drop-shadow-2xl"
                >
                  {displayTrack.title}
                </motion.h3>
                <div className="flex items-center gap-4 mt-5">
                  <p 
                    className="text-[12px] sm:text-[14px] font-black uppercase tracking-[0.4em]" 
                    style={{ color: `hsla(${activeHue}, 80%, 85%, 0.7)` }}
                  >
                    {displayTrack.artist}
                  </p>
                  <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">• Global Curation</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: `0 15px 40px -10px hsla(${activeHue}, 80%, 40%, 0.5)` }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlay} 
                  className="w-20 h-20 sm:w-24 h-24 rounded-full text-white flex items-center justify-center shadow-2xl transition-all duration-300" 
                  style={{ 
                    backgroundColor: `hsla(${activeHue}, 80%, 55%, 1)`,
                  }}
                >
                  {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-2" />}
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleExpand} 
                  className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center text-white border border-white/10 shadow-xl"
                >
                  <ChevronDown size={32} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
});

PersistentPlayer.displayName = "PersistentPlayer";
