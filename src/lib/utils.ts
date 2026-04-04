import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const hueCache = new Map<string, number>();

export function normalizeUnicode(str: string): string {
  if (!str) return "";
  return str.normalize('NFKD').replace(/[\u0300-\u036f]/g, "").replace(/[^\x00-\x7F]/g, "");
}

export function normalizeIdentity(str: string): string {
  if (!str) return "";
  let normalized = normalizeUnicode(str).toLowerCase();
  normalized = normalized.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  normalized = normalized.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '');
  const keywords = ['official', 'video', 'audio', 'music', 'lyrics', 'hd', '4k', 'vevo', 'topic', 'remix', 'prod', 'feat', 'ft', 'hq', 'original'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  normalized = normalized.replace(regex, '').replace(/[^a-z0-9]/gi, '');
  return normalized.trim();
}

export function getIdentityKey(title: string, artist: string): string {
  const t = normalizeIdentity(title);
  const a = normalizeIdentity(artist);
  if (!t) return `unk_${Math.random()}`;
  if (t.length > 3 && a.length > 3 && (t.includes(a) || a.includes(t))) return t;
  return `${t}|${a}`;
}

export function getFuzzyScore(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  const editDistance = (a: string, b: string) => {
    const costs = [];
    for (let i = 0; i <= a.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= b.length; j++) {
        if (i === 0) costs[j] = j;
        else if (j > 0) {
          let newValue = costs[j - 1];
          if (a.charAt(i - 1) !== b.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[b.length] = lastValue;
    }
    return costs[b.length];
  };
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

// PRODUCTION RENDERING FIX: DEFERRED HUE EXTRACTION
export async function extractHueFromImage(videoId: string): Promise<number | null> {
  if (typeof window === 'undefined' || !videoId) return null;
  if (hueCache.has(videoId)) return hueCache.get(videoId)!;
  
  return new Promise((resolve) => {
    // DEFER UNTIL STABLE
    setTimeout(() => {
      const img = new Image();
      const imageUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=50&h=30&output=jpg&q=5`;
      img.crossOrigin = "Anonymous";
      
      const timeout = setTimeout(() => { img.src = ""; resolve(null); }, 2000);

      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0);
          
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

          // Bucket colors into 12 hue segments, tracking saturation-weighted count
          const hueBuckets: Record<number, { count: number; totalSat: number }> = {};

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const lightness = (max + min) / 2;
            const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));

            // Skip near-white, near-black, near-grey — they are visually uninteresting
            if (lightness > 0.88 || lightness < 0.1 || saturation < 0.2) continue;

            // Calculate hue
            let hue = 0;
            if (max === r) hue = (60 * ((g - b) / (max - min)) + 360) % 360;
            else if (max === g) hue = 60 * ((b - r) / (max - min)) + 120;
            else hue = 60 * ((r - g) / (max - min)) + 240;

            // Bucket into 12 segments of 30 degrees each
            const bucket = Math.floor(hue / 30) * 30;
            if (!hueBuckets[bucket]) hueBuckets[bucket] = { count: 0, totalSat: 0 };
            hueBuckets[bucket].count++;
            hueBuckets[bucket].totalSat += saturation;
          }

          // Find the bucket with the highest saturation-weighted count
          let bestHue = 161; // fallback to default teal
          let bestScore = 0;

          for (const [bucketKey, { count, totalSat }] of Object.entries(hueBuckets)) {
            const score = count * (totalSat / count); // frequency × avg saturation
            if (score > bestScore) {
              bestScore = score;
              bestHue = parseInt(bucketKey) + 15; // center of the bucket
            }
          }

          // Only use extracted hue if we found enough vivid pixels
          const h = bestScore > 20 ? bestHue : 161;
          
          hueCache.set(videoId, h);
          if (hueCache.size > 200) {
            hueCache.delete(hueCache.keys().next().value);
          }
          resolve(h);
        } catch (e) { resolve(null); }
      };
      img.onerror = () => { clearTimeout(timeout); resolve(null); };
      img.src = proxiedUrl;
    }, 100); // DEFERRED 100ms
  });
}
