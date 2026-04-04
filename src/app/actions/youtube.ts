'use server';

/**
 * PRODUCTION DISCOVERY ENGINE v115.2 (Vercel IP Resilient)
 */

import { Innertube, UniversalCache } from 'youtubei.js';
import { getIdentityKey, getFuzzyScore, normalizeIdentity, normalizeUnicode } from '@/lib/utils';
import { containsKpop } from '@/lib/kpop-filter';

export interface CrawlerSong {
  title: string;
  artist: string;
  videoId: string;
  hue: number;
  identityHash: string;
}

export interface DiscoveryEvent {
  type: 'log' | 'song' | 'error' | 'done' | 'progress' | 'stats';
  message?: string;
  data?: any;
}

export interface TrackInfo {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  hue?: number;
}

const NON_MUSIC_KEYWORDS = [
  'interview', 'scene', 'clip', 'reaction', 'trailer', 'status', 'teaser', 'bts', 'behind the scenes', 'talk', 'live news', 'documentary', 'movie part'
];

let ytInstance: Innertube | null = null;

// Eagerly warm the engine at module load — not inside a function
Innertube.create({
  cache: new UniversalCache(false),
  generate_session_locally: true,
}).then(instance => {
  ytInstance = instance;
}).catch(() => {
  // Will retry on first actual request via getYt()
});

// HARDENED ENGINE INIT FOR VERCEL
async function getYt(retries = 3): Promise<Innertube> {
  if (ytInstance) return ytInstance;
  
  for (let i = 0; i < retries; i++) {
    try {
      ytInstance = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true,
      });
      return ytInstance;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("Discovery Engine Blocked.");
}

export async function preWarmEngine() {
  try {
    await getYt();
    return true;
  } catch (e) {
    return false;
  }
}

function calculateProbabilisticScore(
  item: any, 
  targetQuery: string,
  relaxed: boolean = false
): { score: number; isRejected: boolean; reason?: string } {
  const title = normalizeUnicode(item.title?.toString() || "");
  const channel = normalizeUnicode(item.author?.name || "");
  
  if (containsKpop(title) || containsKpop(channel)) {
    return { score: 0, isRejected: true, reason: 'KPOP_RESTRICTED' };
  }

  const lowerTitle = title.toLowerCase();
  if (NON_MUSIC_KEYWORDS.some(k => lowerTitle.includes(k))) {
    return { score: 0, isRejected: true, reason: 'NON_MUSIC_CONTENT' };
  }

  const formatBlacklist = ['playlist', 'jukebox', 'collection', 'mashup', 'compilation', 'full album'];
  const hasFormatConflict = formatBlacklist.some(w => lowerTitle.includes(w));
  
  if (!relaxed && hasFormatConflict) {
    return { score: 0, isRejected: true, reason: 'MIX_FORMAT' };
  }

  let score = 40;
  const similarity = getFuzzyScore(normalizeIdentity(title), normalizeIdentity(targetQuery));
  
  const isVerified = item.author?.is_verified || item.author?.name?.toLowerCase().includes('vevo') || item.author?.name?.toLowerCase().includes('topic');
  if (isVerified) score += 30; 
  score += Math.round(similarity * 60);

  const finalScore = Math.min(100, score);
  const threshold = relaxed ? 30 : 50; 
  
  if (finalScore < threshold) {
    return { score: finalScore, isRejected: true, reason: 'LOW_CONFIDENCE' };
  }
  
  return { score: finalScore, isRejected: false };
}

export async function* discoveryPipelineGenerator(
  query: string, 
  count: number, 
  blacklistHashes: string[] = []
): AsyncGenerator<DiscoveryEvent> {
  let client;
  try { client = await getYt(); } catch (e: any) {
    yield { type: 'error', message: `Engine Fault: Discovery Blocked on Cloud IP.` };
    return;
  }

  const sessionSeenIds = new Set<string>();
  const sessionIdentityHashes = new Set<string>(blacklistHashes);
  const variations = [`${query}`, `${query} music video`, `${query} official`];

  let committed = 0;
  for (const vQuery of variations) {
    if (committed >= count) break;
    try {
      const searchResult = await client.search(vQuery, { type: 'video' });
      const candidates = (searchResult.results || []).filter((c: any) => c.type === 'Video').slice(0, 10);

      for (const item of candidates) {
        if (!item.id || committed >= count || sessionSeenIds.has(item.id)) continue;

        const title = item.title?.toString() || "Unknown";
        const channel = item.author?.name || "Unknown";
        const identityHash = getIdentityKey(title, channel);
        
        if (sessionIdentityHashes.has(identityHash)) continue;

        const scoring = calculateProbabilisticScore(item, query, committed > count / 2);
        if (scoring.isRejected) continue;

        sessionSeenIds.add(item.id);
        sessionIdentityHashes.add(identityHash);
        committed++;
        
        yield { type: 'song', data: { title, artist: channel, videoId: item.id, hue: (item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360), identityHash } as CrawlerSong };
      }
    } catch (e) {}
  }

  yield { type: 'done' };
}

export async function resolveSpecificTrack(query: string): Promise<CrawlerSong | null> {
  try {
    const client = await getYt();
    const search = await client.search(`${query}`, { type: 'video' });
    const item = search.results?.filter(c => c.type === 'Video').find(i => {
      const title = i.title?.toString().toLowerCase() || "";
      return !NON_MUSIC_KEYWORDS.some(k => title.includes(k)) && !containsKpop(title);
    });
    
    if (item && item.id) {
      return {
        videoId: item.id,
        title: item.title?.toString() || "Unknown",
        artist: item.author?.name || "Unknown",
        hue: (item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360),
        identityHash: getIdentityKey(item.title?.toString() || "", item.author?.name || "")
      };
    }
  } catch (e) {}
  return null;
}

export async function searchAndGetStream(title: string, artist: string): Promise<TrackInfo | null> {
  const res = await resolveSpecificTrack(`${title} ${artist}`);
  if (!res || !res.videoId) return null;
  return {
    videoId: res.videoId,
    title: res.title,
    artist: res.artist,
    thumbnail: `https://i.ytimg.com/vi/${res.videoId}/mqdefault.jpg`,
    duration: 0,
    hue: res.hue
  };
}
