"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { VibeBackground } from "@/components/VibeBackground";
import { MoodInput } from "@/components/MoodInput";
import { SongList, type Song } from "@/components/SongList";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { OpeningScreen } from "@/components/OpeningScreen";
import { PersistentPlayer } from "@/components/PersistentPlayer";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { ExportFAB } from "@/components/ExportFAB";
import { ExportGuideDialog } from "@/components/ExportGuideDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useVibeFeedback } from "@/hooks/use-vibe-feedback";
import { preWarmEngine, type TrackInfo } from "@/app/actions/youtube";
import { getTLGGPlaylistId } from "@/app/actions/get-tlgg-id";
import { useGenerationSession } from "@/hooks/use-generation-session";
import { useHistoryManager, type HistoryItem } from "@/hooks/use-history-manager";
import { usePlayback } from "@/hooks/use-playback";
import { AlertCircle, RefreshCcw, Sparkles } from "lucide-react";

const GOOGLE_AI_KEY_STORAGE = "pulsyvibe_google_ai_key";
const PLAYBACK_MODE_KEY = "pulsyvibe_playback_mode";
const DOWNLOAD_METHOD_KEY = "pulsyvibe_download_method";
const GUID_STORAGE_KEY = "pulsyvibe_has_seen_guide";
const THEME_STORAGE_KEY = "pulsyvibe_theme";

export interface AIDJState {
  title?: string;
  djMessage?: string;
  tone?: 'emotional' | 'calm' | 'savage' | 'motivational';
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [songs, setSongs] = useState<Song[]>([]); 
  const [currentMood, setCurrentMood] = useState("");
  const [requestedCount, setRequestedCount] = useState(12);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("teal");
  const [lastUsedLanguage, setLastUsedLanguage] = useState("GLOBAL");
  
  const [googleAiKey, setGoogleAiKey] = useState<string | null>(null);
  const [showKeyPortal, setShowKeyPortal] = useState(false);
  const hasShownKeyPortalRef = useRef(false);
  
  const [dynamicColors, setDynamicColors] = useState(true);
  const [downloadMethod, setDownloadMethod] = useState<'organic' | 'syncx' | 'faces100'>('organic');
  const [playbackMode, setPlaybackMode] = useState<'audio' | 'video'>('video');
  
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isMajorBlocked, setIsMajorBlocked] = useState(false);
  const [isContaminated, setIsContaminated] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showExportGuide, setShowExportGuide] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  
  const [extractedHue, setExtractedHue] = useState<number | null>(null);
  const [aiDjResponse, setAiDjResponse] = useState<AIDJState | null>(null);
  const [isHistoryView, setIsHistoryView] = useState(false);
  const [currentVibeId, setCurrentVibeId] = useState<string | null>(null);

  // Lifted global memory state to resolve repeated songs bug
  const [globalSeenTitles, setGlobalSeenTitles] = useState<string[]>([]);

  const allSongsBufferRef = useRef<Song[]>([]);
  const activeSessionIdRef = useRef<string | null>(null);
  const resolvedTitlesRegistry = useRef<Set<string>>(new Set());
  const inFlightResolutions = useRef<Set<string>>(new Set());

  const resultsRef = useRef<HTMLDivElement>(null);
  const { feedback } = useVibeFeedback();

  const handleMissingKey = useCallback(() => {
    if (!hasShownKeyPortalRef.current) {
      setShowKeyPortal(true);
      hasShownKeyPortalRef.current = true;
    }
  }, []);

  const playback = usePlayback({
    feedback,
    isMajorBlocked,
    isContaminated,
    songs,
    allSongsBufferRef,
    activeSessionIdRef,
    resolvedTitlesRegistry,
    inFlightResolutions
  });

  const generation = useGenerationSession({
    googleAiKey,
    globalSeenTitles,
    onMissingKey: handleMissingKey,
    feedback,
    setSongs,
    setAiDjResponse,
    setVideoLinks: playback.setVideoLinks,
    setConsoleLogs,
    setCurrentMood,
    setRequestedCount,
    setIsMajorBlocked,
    setIsContaminated,
    setIsError,
    setIsHistoryView,
    setExportSuccess,
    setExporting,
    allSongsBufferRef,
    activeSessionIdRef,
    resolvedTitlesRegistry,
    inFlightResolutions,
    resultsRef
  });

  const historyManager = useHistoryManager({
    resetSession: generation.resetSession,
    setSongs,
    setAiDjResponse,
    setVideoLinks: playback.setVideoLinks,
    setConsoleLogs,
    setCurrentMood,
    setCurrentVibeId,
    setRequestedCount,
    setIsHistoryView,
    isHistoryView,
    resultsRef,
    feedback,
    globalSeenTitles,
    setGlobalSeenTitles
  });

  useEffect(() => {
    setIsMounted(true);
    preWarmEngine();

    const savedKey = localStorage.getItem(GOOGLE_AI_KEY_STORAGE);
    if (savedKey) setGoogleAiKey(savedKey);
    
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) setCurrentTheme(savedTheme);

    const seenGuide = localStorage.getItem(GUID_STORAGE_KEY);
    if (savedTheme) setHasSeenGuide(true);

    const savedMode = localStorage.getItem(PLAYBACK_MODE_KEY);
    if (savedMode === 'audio' || savedMode === 'video') setPlaybackMode(savedMode);

    const savedDownload = localStorage.getItem(DOWNLOAD_METHOD_KEY);
    if (savedDownload === 'organic' || savedDownload === 'syncx' || savedDownload === 'faces100') {
      setDownloadMethod(savedDownload);
    }
  }, []);

  useEffect(() => {
    if (!generation.isGenerating && generation.currentVibeId && allSongsBufferRef.current.length > 0) {
      const timeout = setTimeout(() => {
        historyManager.commitToHistory(generation.currentVibeId!, currentMood, aiDjResponse, allSongsBufferRef.current, playback.videoLinks);
      }, 3000); 
      return () => clearTimeout(timeout);
    }
  }, [generation.isGenerating, generation.currentVibeId, currentMood, aiDjResponse, playback.videoLinks, historyManager, allSongsBufferRef]);

  useEffect(() => {
    if (!generation.isGenerating || isMajorBlocked || isContaminated || !generation.currentVibeId) return;
    const sessionAtStart = generation.currentVibeId;

    generation.typingTimerRef.current = setInterval(() => {
      if (activeSessionIdRef.current !== sessionAtStart) {
        clearInterval(generation.typingTimerRef.current);
        return;
      }
      
      setSongs(curr => {
        const nextIdx = curr.length;
        if (generation.isFetchingRef.current && nextIdx >= allSongsBufferRef.current.length) {
          return curr;
        }

        if (!generation.isFetchingRef.current && nextIdx >= allSongsBufferRef.current.length) {
          generation.setIsGenerating(false);
          clearInterval(generation.typingTimerRef.current);
          return curr;
        }
        
        const nextSong = allSongsBufferRef.current[nextIdx];
        if (nextSong) {
          requestAnimationFrame(() => feedback('tick'));
          return [...curr, nextSong];
        }
        return curr;
      });
    }, 160);

    return () => clearInterval(generation.typingTimerRef.current);
  }, [generation.isGenerating, isMajorBlocked, isContaminated, generation.currentVibeId, feedback, generation.isFetchingRef, allSongsBufferRef, activeSessionIdRef, generation.setIsGenerating, generation.typingTimerRef]);

  const executeExport = useCallback(async (hideAgain?: boolean) => {
    if (hideAgain) {
      localStorage.setItem(GUID_STORAGE_KEY, "true");
      setHasSeenGuide(true);
    }
    const validIds = songs.map(s => playback.videoLinks[s.title]?.videoId).filter(Boolean);
    if (validIds.length === 0) return;
    
    feedback('click');
    setExporting(true);
    try {
      const tlggId = await getTLGGPlaylistId(validIds as string[]);
      const url = tlggId 
        ? `https://music.youtube.com/watch?v=${validIds[0]}&list=${tlggId}` 
        : `https://www.youtube.com/watch_videos?video_ids=${validIds.join(',')}`;
      window.open(url, '_blank');
      setExportSuccess(true);
      feedback('success');
    } catch (e) {
      const fallbackUrl = `https://www.youtube.com/watch_videos?video_ids=${validIds.join(',')}`;
      window.open(fallbackUrl, '_blank');
    } finally { setExporting(false); setShowExportGuide(false); }
  }, [songs, playback.videoLinks, feedback]);

  const immersiveStyles = useMemo(() => {
    if (currentTheme === 'immersive' && extractedHue !== null) {
      const h = extractedHue;
      return {
        '--background':        `${h} 35% 8%`,
        '--foreground':        `${h} 15% 95%`,
        '--card':              `${h} 30% 12%`,
        '--card-foreground':   `${h} 10% 95%`,
        '--popover':           `${h} 30% 10%`,
        '--popover-foreground':`${h} 10% 95%`,
        '--primary':           `${h} 85% 65%`,
        '--primary-foreground':`${h} 50% 5%`,
        '--secondary':         `${h} 20% 16%`,
        '--secondary-foreground': `${h} 10% 85%`,
        '--muted':             `${h} 20% 14%`,
        '--muted-foreground':  `${h} 15% 55%`,
        '--accent':            `${(h + 40) % 360} 80% 68%`,
        '--accent-foreground': `${(h + 40) % 360} 50% 5%`,
        '--border':            `${h} 25% 20%`,
        '--input':             `${h} 25% 18%`,
        '--ring':              `${h} 85% 65%`,
        'transition':          'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'willChange':          'background-color, color',
      } as React.CSSProperties;
    }
    return {};
  }, [currentTheme, extractedHue]);

  const updateDownloadMethod = useCallback((val: 'organic' | 'syncx' | 'faces100') => {
    setDownloadMethod(val);
    localStorage.setItem(DOWNLOAD_METHOD_KEY, val);
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (!playback.activeTrack || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => 
      playback.videoLinks[s.title]?.videoId === playback.activeTrack?.videoId
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      playback.handlePlaySong(songs[nextIndex]);
    }
  }, [playback.activeTrack, songs, playback.videoLinks, playback.handlePlaySong]);

  if (!isMounted) return null;

  return (
    <>
      <main 
        style={immersiveStyles}
        className="min-h-screen relative flex flex-col items-center bg-background overflow-x-hidden transform-gpu"
      >
        <VibeBackground activeHue={extractedHue !== null ? extractedHue : playback.activeTrack?.hue} isPlaying={!!playback.activeTrack} currentTheme={currentTheme} />
        <AnimatePresence mode="wait">
          {showSplash ? (
            <OpeningScreen key="splash" onComplete={() => setShowSplash(false)} />
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full relative flex flex-col items-center pb-48">
              <div className="fixed top-8 left-8 z-50 flex items-center gap-3">
                <HistorySidebar history={historyManager.history} onSelect={historyManager.handleSelectHistory} onClear={() => { historyManager.setHistory([]); setGlobalSeenTitles([]); }} />
                <SettingsDialog 
                  dynamicColors={dynamicColors} setDynamicColors={setDynamicColors} 
                  downloadMethod={downloadMethod} setDownloadMethod={updateDownloadMethod}
                  cacheName="pulsyvibe_cache_v2" onReset={() => window.location.reload()}
                  apiKey={googleAiKey} onUpdateKey={(key) => { localStorage.setItem(GOOGLE_AI_KEY_STORAGE, key); setGoogleAiKey(key); }}
                  playbackMode={playbackMode} setPlaybackMode={setPlaybackMode}
                />
              </div>

              <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
                <ThemeToggle currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
              </div>
              
              <div className="w-full max-w-[640px] mx-auto pt-24 md:pt-36 px-4 flex flex-col items-center gap-20">
                <MoodInput onGenerate={generation.handleGenerate} onSearch={generation.handleSearchSpecific} isLoading={generation.isGenerating} currentTheme={currentTheme} activeHue={extractedHue} />
                
                <div ref={resultsRef} className="w-full scroll-mt-32 min-h-[400px]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {(isMajorBlocked || isContaminated) ? (
                      <motion.div key="block" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 gap-8">
                        <div className="w-56 h-56 rounded-[4rem] glass flex items-center justify-center text-8xl animate-bounce shadow-2xl">😂🫵</div>
                        <h3 className="text-3xl font-black uppercase text-white tracking-[0.3em] text-center drop-shadow-xl">
                          {isContaminated ? "Bro tried to sneak K-pop again" : "Nice try. No K-pop here."}
                        </h3>
                      </motion.div>
                    ) : isError ? (
                      <motion.div key="error" className="flex flex-col gap-12 w-full">
                        <div className="flex flex-col items-center justify-center gap-8 max-w-md mx-auto text-center mb-10 py-12 glass-bento rounded-[3rem]">
                          <div className="w-24 h-24 rounded-full glass flex items-center justify-center text-red-500 border border-red-500/10 shadow-lg">
                            <AlertCircle size={40} />
                          </div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em]">AI Sync Fault</h3>
                          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.4em] leading-relaxed px-10 opacity-60">AI is unavailable, attempting recovery...</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => generation.handleGenerate(currentMood, requestedCount, lastUsedLanguage)}
                            className="mt-4 px-10 py-5 rounded-full bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl btn-glow-primary"
                          >
                            <RefreshCcw size={16} />
                            Retry Sync
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (songs.length > 0 || generation.isGenerating) && (
                      <motion.div key={`results-${generation.currentVibeId}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-12 w-full">
                        <div className="flex flex-col pb-10 px-10 gap-4 relative overflow-hidden glass-bento rounded-[3rem] pt-10 bg-gradient-to-br from-primary/5 via-white/[0.01] to-transparent">
                          <div className="space-y-3 relative">
                            <div className="flex items-center gap-3">
                              <Sparkles size={14} className="text-primary animate-pulse" />
                              <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] opacity-60">Cognitive Journey</p>
                            </div>
                            <h3 className="text-[clamp(1.7rem,7vw,2.5rem)] font-black tracking-tight text-white uppercase leading-tight drop-shadow-2xl">
                              <span className="text-gradient">{aiDjResponse?.title || currentMood}</span>
                            </h3>
                          </div>
                        </div>
                        <SongList 
                          songs={songs} activeTrack={playback.activeTrack} loadingTrack={playback.loadingTrack}
                          onPlay={playback.handlePlaySong} videoLinks={playback.videoLinks}
                          downloadMethod={downloadMethod} isGenerating={generation.isGenerating}
                          dynamicColors={dynamicColors}
                          consoleLogs={consoleLogs} targetCount={requestedCount}
                          sessionType={generation.sessionType} isHistoryView={isHistoryView}
                          aiDjResponse={aiDjResponse}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <ApiKeyDialog open={showKeyPortal} onOpenChange={setShowKeyPortal} onSave={(key) => { localStorage.setItem(GOOGLE_AI_KEY_STORAGE, key); setGoogleAiKey(key); }} />
        <ExportGuideDialog open={showExportGuide} onOpenChange={setShowExportGuide} onConfirm={executeExport} isLoading={exporting} />
      </main>
      <PersistentPlayer 
        activeTrack={playback.activeTrack} 
        playbackMode={playbackMode} 
        currentTheme={currentTheme}
        onColorExtract={(hue) => {
          setExtractedHue(hue);
        }} 
        onTrackEnd={handleTrackEnd}
      />
      <ExportFAB 
        isVisible={songs.length > 0 && !isMajorBlocked && !isContaminated} 
        onClick={() => {
          if (hasSeenGuide) {
            executeExport();
          } else {
            feedback('click');
            setShowExportGuide(true);
          }
        }} 
        isLoading={exporting} 
        isSuccess={exportSuccess} 
        isPlayerActive={!!playback.activeTrack} 
      />
    </>
  );
}