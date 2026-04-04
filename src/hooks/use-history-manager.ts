import { useState, useEffect, useCallback, useRef } from "react";
import { Song } from "@/components/SongList";
import { AIDJState } from "@/app/page";

export interface HistoryItem {
  id: string;
  query: string;
  vibeLabel: string;
  djMessage?: string;
  region: string;
  playlist: {
    videoId: string;
    title: string;
    artist: string;
    hue: number;
    vibe?: string;
  }[];
  timestamp: number;
  totalTracks: number;
}

const HISTORY_STORAGE_KEY = "pulsyvibe_sync_v28";
const SEEN_TITLES_KEY = "pulsyvibe_global_seen_titles_v1";

interface HistoryManagerProps {
  resetSession: (id: string) => void;
  setSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  setAiDjResponse: React.Dispatch<React.SetStateAction<AIDJState | null>>;
  setVideoLinks: React.Dispatch<React.SetStateAction<any>>;
  setConsoleLogs: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentMood: React.Dispatch<React.SetStateAction<string>>;
  setCurrentVibeId: React.Dispatch<React.SetStateAction<string | null>>;
  setRequestedCount: React.Dispatch<React.SetStateAction<number>>;
  setIsHistoryView: React.Dispatch<React.SetStateAction<boolean>>;
  isHistoryView: boolean;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  feedback: (type: any) => void;
  globalSeenTitles: string[];
  setGlobalSeenTitles: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useHistoryManager = ({
  resetSession,
  setSongs,
  setAiDjResponse,
  setVideoLinks,
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
}: HistoryManagerProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const lastSavedVibeIdRef = useRef<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 25));
      } catch (e) {}
    }
    
    const savedSeen = localStorage.getItem(SEEN_TITLES_KEY);
    if (savedSeen) {
      try {
        const parsed = JSON.parse(savedSeen);
        if (Array.isArray(parsed)) setGlobalSeenTitles(parsed.slice(0, 500));
      } catch (e) {}
    }
  }, [setGlobalSeenTitles]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(SEEN_TITLES_KEY, JSON.stringify(globalSeenTitles.slice(0, 500)));
  }, [globalSeenTitles]);

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    const generateSafeId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newId = generateSafeId();
    resetSession(newId);
    setConsoleLogs([]); 
    setIsHistoryView(true);
    setCurrentMood(item.query);
    setCurrentVibeId(item.id);
    setRequestedCount(item.totalTracks);
    setAiDjResponse({ title: item.vibeLabel || item.query, djMessage: item.djMessage });
    
    const restoredSongs: Song[] = item.playlist.map(t => ({
      s_id: generateSafeId(),
      title: t.title,
      artist: t.artist,
      vibe: t.vibe || "Stored",
      color: t.hue,
      restricted: false
    }));

    const restoredLinks = item.playlist.reduce((acc: any, t) => {
      acc[t.title] = { title: t.title, artist: t.artist, videoId: t.videoId, hue: t.hue, identityHash: t.title + '|' + t.artist };
      return acc;
    }, {});

    setVideoLinks(restoredLinks);
    setSongs(restoredSongs);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    feedback('success');
  }, [resetSession, setSongs, setAiDjResponse, setVideoLinks, setCurrentMood, setCurrentVibeId, setRequestedCount, setIsHistoryView, resultsRef, feedback, setConsoleLogs]);

  const commitToHistory = useCallback(async (sessionId: string, mood: string, djState: AIDJState | null, buffer: Song[], links: Record<string, any>) => {
    if (isHistoryView || lastSavedVibeIdRef.current === sessionId) return;
    
    const finalSongs = buffer.map(s => {
      const link = links[s.title];
      return {
        title: s.title,
        artist: s.artist,
        videoId: link?.videoId || "",
        hue: s.color || link?.hue || 161,
        vibe: s.vibe || "Curated"
      };
    }).filter(s => s.videoId);

    if (finalSongs.length > 0) {
      lastSavedVibeIdRef.current = sessionId;
      
      const newTitles = finalSongs.map(s => s.title);
      setGlobalSeenTitles(prev => {
        const filtered = prev.filter(t => !newTitles.includes(t));
        return [...newTitles, ...filtered].slice(0, 500);
      });

      const newHistoryItem: HistoryItem = {
        id: sessionId,
        query: mood,
        vibeLabel: djState?.title || mood,
        djMessage: djState?.djMessage,
        region: "GLOBAL",
        playlist: finalSongs,
        timestamp: Date.now(),
        totalTracks: finalSongs.length
      };
      
      setHistory(prev => {
        const filtered = prev.filter(item => item.id !== sessionId);
        return [newHistoryItem, ...filtered].slice(0, 25);
      });
    }
  }, [isHistoryView, setGlobalSeenTitles]);

  return {
    history,
    setHistory,
    globalSeenTitles,
    setGlobalSeenTitles,
    handleSelectHistory,
    commitToHistory
  };
};