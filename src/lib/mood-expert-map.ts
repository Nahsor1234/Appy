/**
 * @fileOverview Hardened Mood Expert Map (Curated Edition).
 * Strictly focused on the requested vibes and genres.
 */

export type MoodEntry = {
  signals: string;
  genres: string;
  exclude: string;
  energy: 'high' | 'mid' | 'low';
};

export const MOOD_EXPERT_MAP: Record<string, MoodEntry> = {
  "late night drive": { signals: "neon lights, smooth roads, synthwave, midnight atmosphere", genres: "synthwave, electronic, dark pop", exclude: "acoustic, happy, morning, bright", energy: 'mid' },
  "midnight thoughts": { signals: "introspection, quiet, deep thinking, stars", genres: "ambient, lofi, soft indie", exclude: "party, loud, high energy", energy: 'low' },
  "chill evening": { signals: "sunset, unwinding, soft lighting, relaxation", genres: "jazz, soul, chillhop", exclude: "heavy metal, aggressive, gym", energy: 'low' },
  "deep focus": { signals: "no distractions, flow state, sharp concentration", genres: "instrumental, techno, minimal", exclude: "loud vocals, distracting lyrics", energy: 'mid' },
  "calm & relax": { signals: "breathing, stillness, peace, meditation", genres: "nature sounds, ambient, acoustic", exclude: "intense, fast, loud", energy: 'low' },
  "feel good": { signals: "smiles, sunshine, positive energy, uplifting", genres: "pop, funk, disco", exclude: "sad, heartbreak, dark", energy: 'high' },
  "motivation mode": { signals: "power, drive, ambition, rising up", genres: "rock, hip hop anthems, edm", exclude: "lazy, slow, sad", energy: 'high' },
  "high energy": { signals: "adrenaline, fast movement, excitement", genres: "drum & bass, trap, metal", exclude: "chill, sleep, soft", energy: 'high' },
  "party mode": { signals: "euphoria, celebration, dancefloor, high tempo", genres: "edm, house, punjabi beats", exclude: "slow, sad, lofi", energy: 'high' },
  "weekend vibes": { signals: "freedom, casual, fun, effortless", genres: "indie pop, surf rock, upbeat hits", exclude: "work, stress, focus", energy: 'high' },
  "heartbreak": { signals: "sadness, loss, missing someone, tears", genres: "sad pop, piano ballads, r&b", exclude: "happy, love, party", energy: 'low' },
  "moving on": { signals: "strength, healing, closure, starting over", genres: "empowerment pop, soft rock", exclude: "depressing, negative, dark", energy: 'mid' },
  "romantic": { signals: "love, intimacy, warmth, candlelit", genres: "soul, romantic pop, r&b", exclude: "angry, heavy, dark", energy: 'low' },
  "soft love": { signals: "tenderness, gentle, sweetness, whispers", genres: "acoustic, indie folk, jazz", exclude: "loud, aggressive, club", energy: 'low' },
  "nostalgia": { signals: "memories, retro, vintage warmth, yearning", genres: "80s pop, 90s hits, retro bollywood", exclude: "futuristic, modern trap", energy: 'low' },
  "lonely nights": { signals: "isolation, echo, silence, yearning", genres: "dark ambient, sad indie", exclude: "crowded, happy, party", energy: 'low' },
  "bollywood hits": { signals: "cinematic, grand, emotional, melodic", genres: "bollywood, filmi", exclude: "underground, experimental", energy: 'high' },
  "hindi indie": { signals: "original, soulful, poetic, non-film", genres: "hindi indie, indie folk", exclude: "mainstream film, heavy edm", energy: 'mid' },
  "punjabi beats": { signals: "bhangra, high bass, swagger, energetic", genres: "punjabi pop, bhangra", exclude: "silent, soft, slow", energy: 'high' },
  "desi hip hop": { signals: "street, real, rhythmic, bars", genres: "dhh, rap", exclude: "classical, soft", energy: 'high' },
  "indian pop": { signals: "catchy, modern, vibrant", genres: "i-pop, pop", exclude: "traditional, slow", energy: 'high' },
  "south indian music": { signals: "melodic, rhythmic, vibrant", genres: "tamil, telugu, malayalam pop", exclude: "lofi, dark", energy: 'high' },
  "lofi beats": { signals: "muffled, vinyl crackle, study, relax", genres: "lofi, chillhop", exclude: "high energy, clear vocals", energy: 'low' },
  "acoustic sessions": { signals: "raw, unplugged, strings, intimate", genres: "acoustic, folk", exclude: "electronic, distorted", energy: 'low' },
  "electronic dance": { signals: "synthesizers, rhythm, light show", genres: "house, techno, edm", exclude: "acoustic, quiet", energy: 'high' },
  "house & chill": { signals: "beachy, deep, steady, relaxed dance", genres: "deep house, tropical house", exclude: "aggressive, metal", energy: 'mid' },
  "retro classics": { signals: "timeless, old gold, vinyl", genres: "70s, 80s classics", exclude: "modern trap, new releases", energy: 'mid' },
  "2000s hits": { signals: "y2k, childhood anthems, pop-punk", genres: "2000s pop, r&b", exclude: "retro, modern indie", energy: 'high' },
  "study session": { signals: "focus, background, consistent", genres: "classical, minimal, lofi", exclude: "lyrics, high energy", energy: 'mid' },
  "workout flow": { signals: "rhythm, sweat, intensity, rhythm", genres: "trap, edm, rock", exclude: "sleeping, soft", energy: 'high' },
  "road trip": { signals: "driving, windows down, singing along", genres: "classic rock, indie pop", exclude: "ambient, boring", energy: 'high' },
  "rainy mood": { signals: "patter, cozy, warm drink, window", genres: "lofi, jazz, soft indie", exclude: "sunshine, party", energy: 'low' },
  "morning boost": { signals: "sunrise, coffee, starting fresh", genres: "happy pop, motivation", exclude: "midnight, dark", energy: 'high' },
  "night coding": { signals: "terminal, darkness, deep focus", genres: "synthwave, techno, dark lofi", exclude: "distracting, bright", energy: 'mid' }
};

export const SYNONYM_MAP: Record<string, string> = {
  "night drive": "late night drive", "midnight drive": "late night drive",
  "thinking": "midnight thoughts", "overthinking": "midnight thoughts",
  "evening": "chill evening", "unwind": "chill evening",
  "focus": "deep focus", "concentrate": "deep focus",
  "calm": "calm & relax", "relax": "calm & relax",
  "happy": "feel good", "joy": "feel good",
  "motivation": "motivation mode", "hustle": "motivation mode",
  "gym": "workout flow", "energetic": "high energy",
  "party": "party mode", "celebrate": "party mode",
  "weekend": "weekend vibes", "sunday": "weekend vibes",
  "sad": "heartbreak", "breakup": "heartbreak",
  "move on": "moving on", "healing": "moving on",
  "love": "romantic", "romance": "romantic",
  "nostalgic": "nostalgia", "throwback": "nostalgia",
  "lonely": "lonely nights", "alone": "lonely nights",
  "hindi": "hindi indie", "bollywood": "bollywood hits",
  "punjabi": "punjabi beats", "rap": "desi hip hop",
  "indian": "indian pop", "study": "study session",
  "rain": "rainy mood", "morning": "morning boost",
  "coding": "night coding", "programming": "night coding"
};
