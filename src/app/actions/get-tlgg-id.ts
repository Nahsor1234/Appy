
'use server';

/**
 * @fileOverview Server Action to resolve the "Magic" TLGG Playlist ID.
 * Hardened with safe fallback logic for redirect failures.
 */

export async function getTLGGPlaylistId(
  videoIds: string[]
): Promise<string | null> {
  if (!videoIds || videoIds.length === 0) return null;
  
  const ids = videoIds.slice(0, 50).join(',');
  const url = `https://www.youtube.com/watch_videos?video_ids=${ids}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    const finalUrl = res.url;
    
    // Check for TLGG in URL
    const match = finalUrl.match(/list=(TL[^&\s]+)/);
    if (match) return match[1];

    // SELF-HEALING: Scrape HTML for listId if redirect didn't expose it
    const html = await res.text();
    const jsonMatch = html.match(/"listId":"(TL[^"]+)"/);
    if (jsonMatch) return jsonMatch[1];
    
    const scriptMatch = html.match(/list=(TL[a-zA-Z0-9_-]+)/);
    if (scriptMatch) return scriptMatch[1];

    return null;
  } catch (e) {
    console.error('TLGG Discovery Exception:', e);
    return null;
  }
}
