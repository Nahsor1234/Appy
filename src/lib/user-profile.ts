/**
 * @fileOverview Local User Taste Learning System v2.0.
 * Tracks interactions locally with time-decay and negative signals.
 */

export type InteractionType = 'PLAY' | 'SEARCH' | 'REPLAY' | 'SKIP' | 'QUICK_SKIP';

export interface UserEvent {
  type: InteractionType;
  value: string; // The mood query, genre, or region
  timestamp: number;
}

const STORAGE_KEY = 'pulsyvibe_user_profile_v1';
const MAX_EVENTS = 100;

const SCORES: Record<InteractionType, number> = {
  PLAY: 2,
  SEARCH: 1,
  REPLAY: 3,
  SKIP: -2,
  QUICK_SKIP: -3
};

export const UserProfile = {
  /**
   * Records a user interaction and maintains a rolling 100-event log.
   */
  trackEvent: (type: InteractionType, value: string) => {
    if (typeof window === 'undefined' || !value) return;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let events: UserEvent[] = saved ? JSON.parse(saved) : [];
      
      events.push({ type, value, timestamp: Date.now() });
      
      // Maintain rolling history
      if (events.length > MAX_EVENTS) {
        events = events.slice(-MAX_EVENTS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      // Catch errors silently in production
    }
  },

  /**
   * Analyzes the event log with time decay.
   * Categorizes preferences into High/Medium tiers for AI guidance.
   */
  getProfileSummary: (): string => {
    if (typeof window === 'undefined') return '';
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return '';
      
      const events: UserEvent[] = JSON.parse(saved);
      const scores: Record<string, number> = {};
      const now = Date.now();
      
      events.forEach(event => {
        const val = event.value.toLowerCase().trim();
        if (!val) return;

        // Exponential decay: ~1.0x at 0h, ~0.7x at 12h, ~0.5x at 24h, ~0.1x at 72h
        const age = now - event.timestamp;
        const ageHours = age / (1000 * 60 * 60);
        const weight = Math.exp(-0.03 * ageHours);
        
        scores[val] = (scores[val] || 0) + (SCORES[event.type] * weight);
      });
      
      // Sort and filter negative scores
      const sorted = Object.entries(scores)
        .filter(([, score]) => score > 0)
        .sort(([, a], [, b]) => b - a);
        
      if (sorted.length === 0) return '';

      const highPref = sorted.slice(0, 3).map(([name]) => name);
      const medPref = sorted.slice(3, 6).map(([name]) => name);

      let summary = '';
      if (highPref.length > 0) summary += `High Leanings: ${highPref.join(', ')}. `;
      if (medPref.length > 0) summary += `Medium Leanings: ${medPref.join(', ')}. `;
      
      return summary.trim();
    } catch (e) {
      return '';
    }
  }
};
