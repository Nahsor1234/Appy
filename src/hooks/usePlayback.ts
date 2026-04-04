
import { useState, useEffect, useCallback, useRef } from "react";
import { resolveSpecificTrack, searchAndGetStream, type TrackInfo, type CrawlerSong } from "@/app/actions/youtube";
import { UserProfile } from "@/lib/user-profile";
import { Song } from "@/components/SongList";

interface PlaybackProps {
  feedback: (type: any) => void;
  isMajorBlocked: boolean;
  isContaminated: boolean;
  songs: Song[];
  allSongsBufferRef: React.MutableRefObject<Song[]>;
  activeSessionIdRef: React.MutableRefObject<string | null>;
}

export const usePlayback = ({
  feedback,
  isMajorBlocked,
  isContaminated,
  songs,
  allSongsBufferRef,
  activeSessionIdRef
}: PlaybackProps) => {
  const [activeTrack, setActiveTrack] = useState<TrackInfo | null>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [videoLinks, setVideoLinks] = useState<Record<string, CrawlerSong>>({});
  const resolvedTitlesRegistry = useRef<Set<string>>(new Set());
  const inFlightResolutions = useRef<Set<string>>(new Set());

  useEffect(() => {
    const worker = setInterval(() => {
      if (isMajorBlocked || isContaminated) return;
      
      const sessionAtExecution = activeSessionIdRef.current;
      const unresolved = allSongsBufferRef.current.filter((s: Song) => 
        !resolvedTitlesRegistry.current.has(s.title) &&
        !inFlightResolutions.current.has(s.title)
      ).slice(0, 2);

      unresolved.forEach(async (song: Song) => {
        inFlightResolutions.current.add(song.title);
        try {
          const result = await resolveSpecificTrack(`${song.title} ${song.artist}`);
          if (result && activeSessionIdRef.current === sessionAtExecution) {
            resolvedTitlesRegistry.current.add(song.title);
            setVideoLinks(prev => ({ ...prev, [song.title]: result }));
          }
        } catch (e) {}
        finally {
          inFlightResolutions.current.delete(song.title);
        }
      });
    }, 1500);

    return () => clearInterval(worker);
  }, [isMajorBlocked, isContaminated, allSongsBufferRef, activeSessionIdRef]);

  const handlePlaySong = useCallback(async (song: Song) => {
    feedback('click');
    UserProfile.trackEvent('PLAY', song.title);
    const preResolved = videoLinks[song.title];
    
    if (preResolved?.videoId) {
      setActiveTrack({ 
        videoId: preResolved.videoId, 
        title: song.title, 
        artist: preResolved.artist || song.artist, 
        thumbnail: `https://i.ytimg.com/vi/${preResolved.videoId}/mqdefault.jpg`, 
        duration: 0, 
        hue: song.color 
      });
      return;
    }
    setLoadingTrack(song.title);
    try {
      const track = await searchAndGetStream(song.title, song.artist);
      if (track?.videoId) {
        setActiveTrack({ ...track, hue: song.color });
      }
    } catch (e) {
      feedback('error');
    } finally {
      setLoadingTrack(null);
    }
  }, [videoLinks, feedback]);

  return {
    activeTrack,
    setActiveTrack,
    loadingTrack,
    setLoadingTrack,
    videoLinks,
    setVideoLinks,
    resolvedTitlesRegistry,
    inFlightResolutions,
    handlePlaySong
  };
};
