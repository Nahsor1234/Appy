"use client";

import { useCallback, useRef, useEffect, useState } from 'react';

type FeedbackType = 'click' | 'hover' | 'success' | 'refresh' | 'error' | 'toggle' | 'tick' | 'play' | 'change';
type HapticPattern = 'tap' | 'play' | 'change' | 'success';

const SOUND_URLS: Record<FeedbackType, string> = {
  click: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  hover: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  success: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/confirmation_001.ogg',
  refresh: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  error: 'https://nu.vgmtreasurechest.com/soundtracks/android-11-ui-sounds-2020/gxtzuxgl/Low%20Battery.ogg',
  toggle: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  tick: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  play: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg',
  change: 'https://gamesounds.xyz/Kenney%27s%20Sound%20Pack/Interface%20Sounds/click_002.ogg'
};

const POOL_SIZE = 4; 
const FEEDBACK_ENABLED_KEY = "pulsyvibe_feedback_enabled";
const FEEDBACK_EVENT_NAME = "vibe_feedback_sync";
const HAPTIC_THROTTLE_MS = 80; 

export const useVibeFeedback = () => {
  const audioPool = useRef<Record<FeedbackType, HTMLAudioElement[]>>({} as any);
  const poolCursors = useRef<Record<FeedbackType, number>>({} as any);
  const lastVibrationTime = useRef<number>(0);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(FEEDBACK_ENABLED_KEY);
    const initialState = saved !== null ? saved === 'true' : true;
    setIsEnabled(initialState);

    // PRODUCTION PRELOAD: Ensure assets are ready instantly
    Object.entries(SOUND_URLS).forEach(([type, url]) => {
      const typeKey = type as FeedbackType;
      audioPool.current[typeKey] = Array.from({ length: POOL_SIZE }, () => {
        const audio = new Audio(url);
        audio.preload = 'auto'; // PRELOAD AUTO
        audio.load();
        return audio;
      });
      poolCursors.current[typeKey] = 0;
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FEEDBACK_ENABLED_KEY) {
        setIsEnabled(e.newValue === 'true');
      }
    };

    const handleSyncEvent = (e: any) => {
      setIsEnabled(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(FEEDBACK_EVENT_NAME, handleSyncEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(FEEDBACK_EVENT_NAME, handleSyncEvent);
    };
  }, []);

  const triggerHaptic = useCallback((type: HapticPattern) => {
    if (typeof window === 'undefined' || !isEnabled || !navigator.vibrate) return;

    const now = Date.now();
    if (now - lastVibrationTime.current < HAPTIC_THROTTLE_MS) return;

    const patterns: Record<HapticPattern, number[]> = {
      tap: [15],
      play: [10, 25, 10],
      change: [12, 35],
      success: [15, 30, 15]
    };

    try {
      navigator.vibrate(patterns[type]);
      lastVibrationTime.current = now;
    } catch (e) {}
  }, [isEnabled]);

  const playSound = useCallback((type: FeedbackType) => {
    if (typeof window === 'undefined' || !isEnabled) return;

    try {
      const pool = audioPool.current[type];
      if (!pool || !pool.length) return;

      const cursor = poolCursors.current[type];
      const soundEffect = pool[cursor];
      
      const volumes: Record<FeedbackType, number> = {
        click: 0.95, 
        hover: 0.85, 
        success: 1.0, 
        refresh: 0.95, 
        error: 0.9, 
        toggle: 0.95, 
        tick: 0.85, 
        play: 0.95, 
        change: 0.9
      };

      soundEffect.volume = volumes[type] || 0.9;
      soundEffect.currentTime = 0;
      
      const playPromise = soundEffect.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }

      poolCursors.current[type] = (cursor + 1) % POOL_SIZE;
    } catch (e) {}
  }, [isEnabled]);

  const feedback = useCallback((type: FeedbackType) => {
    if (!isEnabled) return;
    playSound(type);
    switch (type) {
      case 'success': triggerHaptic('success'); break;
      case 'error': triggerHaptic('change'); break;
      case 'click': triggerHaptic('tap'); break;
      case 'refresh': triggerHaptic('change'); break;
      case 'toggle': triggerHaptic('tap'); break;
      case 'hover': triggerHaptic('tap'); break;
      case 'tick': triggerHaptic('tap'); break;
      case 'play': triggerHaptic('play'); break;
      case 'change': triggerHaptic('change'); break;
      default: break;
    }
  }, [isEnabled, playSound, triggerHaptic]);

  const toggleFeedback = useCallback((val: boolean) => {
    setIsEnabled(val);
    localStorage.setItem(FEEDBACK_ENABLED_KEY, val.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FEEDBACK_EVENT_NAME, { detail: val }));
    }
    if (val && typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10]);
    }
  }, []);

  return { feedback, triggerHaptic, playSound, isEnabled, toggleFeedback };
};