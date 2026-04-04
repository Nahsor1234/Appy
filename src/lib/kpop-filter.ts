/**
 * @fileOverview Single Source of Truth for K-pop Restricted Entities.
 */

export const GLOBAL_KPOP_KEYWORDS = [
  "kpop", "k-pop", "k pop", "korean pop", "korean music", "korean song", "korean songs", 
  "korean artist", "korean idol", "korean band", "korean girl group", "korean boy group",
  "hallyu", "k-idol", "k idol", "k-drama", "kdrama", "idol group",
  "bts", "bangtan", "bangtan boys", "blackpink", "black pink", "twice", "exo", "exo k", "exo m", "stray kids", "seventeen", "itzy", "aespa", "enhypen", "newjeans", "le sserafim", "ive", "txt", "tomorrow x together", "gidle", "g-idle", "red velvet", "mamamoo", "nct", "nct 127", "nct dream", "wayv", "shinee", "super junior", "girls generation", "snsd", "2ne1", "bigbang", "everglow", "kep1er", "izone", "loona", "astro", "jungkook", "taehyung", "jimin", "suga", "j-hope", "lisa", "jennie", "rosé", "taeyeon", "baekhyun", "kai", "taemin", "sunmi", "hyuna", "hwasa", "jessi", "iz*one", "x1", "wanna one", "ioi", "i.o.i"
];

/**
 * Deterministic K-pop detection logic using regex word boundaries to prevent false positives.
 */
export function containsKpop(text: string | null | undefined): boolean {
  if (!text) return false;
  
  // PART 3: Normalize input
  const inputText = text.toLowerCase().trim();
  
  return GLOBAL_KPOP_KEYWORDS.some(keyword => {
    // Escape keyword for regex safety (handles dots, brackets, hyphens)
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // PART 2: Use word boundaries \b to prevent false positives like "id" matching "midnight"
    // PART 4: List cleaned to remove weak/partial keywords like "v", "rm", "pop", etc.
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    if (regex.test(inputText)) {
      // PART 6: DEBUG LOG (TEMP)
      console.log("[KPOP MATCH]", keyword, "INPUT:", inputText);
      return true;
    }
    return false;
  });
}
