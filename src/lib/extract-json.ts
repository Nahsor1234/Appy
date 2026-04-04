
/**
 * @fileOverview Self-Healing JSON Extraction Engine v3.0 (Hardened).
 * Optimized for real-time recovery of malformed or truncated objects.
 */

export function extractJSON<T = unknown>(raw: string): T | null {
  if (!raw || typeof raw !== "string") return null;

  let cleaned = raw.trim();

  // 1. Remove markdown framing
  cleaned = cleaned.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // 2. Direct Parse Fast-Path
  try {
    return JSON.parse(cleaned) as T;
  } catch {}

  // 3. PROGRESSIVE OBJECT EXTRACTION
  const objects = extractAllObjects(cleaned);
  if (objects.length > 0) {
    return objects as unknown as T;
  }

  // 4. Balanced Structure Recovery
  const repaired = repairJSON(cleaned);
  if (repaired) {
    try {
      const parsed = JSON.parse(repaired);
      return (Array.isArray(parsed) ? parsed : [parsed]) as unknown as T;
    } catch {
      // If full repair fails, try extracting from the repaired string
      const subObjects = extractAllObjects(repaired);
      if (subObjects.length > 0) return subObjects as unknown as T;
    }
  }

  return null;
}

/**
 * Scans a string for all top-level completed JSON objects.
 */
function extractAllObjects(str: string): any[] {
  const results: any[] = [];
  let i = 0;
  
  while (i < str.length) {
    const start = str.indexOf("{", i);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;
    let found = false;

    for (let j = start; j < str.length; j++) {
      const char = str[j];
      
      if (escape) { escape = false; continue; }
      if (char === "\\") { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (char === "{") depth++;
      if (char === "}") {
        depth--;
        if (depth === 0) {
          const segment = str.slice(start, j + 1);
          try {
            results.push(JSON.parse(segment));
          } catch {
            const rep = repairJSON(segment);
            if (rep) { 
              try { results.push(JSON.parse(rep)); } catch {} 
            }
          }
          i = j + 1;
          found = true;
          break;
        }
      }
    }
    if (!found) break;
  }
  return results;
}

/**
 * Aggressive JSON repair for truncated streaming data.
 */
function repairJSON(str: string): string | null {
  try {
    // Basic cleanup
    let fixed = str.trim()
      .replace(/,\s*([\]}])/g, "$1") // Trailing commas
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Unquoted keys
      .replace(/'/g, '"'); // Single quotes to double

    // Auto-close open structures
    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (const char of fixed) {
      if (escape) { escape = false; continue; }
      if (char === "\\") { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (char === "[") stack.push("]");
      else if (char === "{") stack.push("}");
      else if (char === "]" || char === "}") {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }

    // Append closing characters in reverse order
    return fixed + stack.reverse().join("");
  } catch {
    return null;
  }
}
