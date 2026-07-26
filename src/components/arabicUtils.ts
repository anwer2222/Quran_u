/**
 * Strips all Arabic Tashkeel, Harakat, Tanween, and Uthmani orthographic marks.
 * Normalizes special letter variants (e.g., Wasla, Superscript Alef) for robust clean matching.
 */
export function stripTashkeel(text: string): string {
    if (!text) return "";
  
    return (
      text
        // 1. Remove standard Tashkeel, Harakat, and Tanween (Range U+064B - U+065F)
        .replace(/[\u064B-\u065F]/g, "")
        // 2. Remove Quranic superscript / subscript marks (e.g., Superscript Alef U+0670, Small High Dot U+06DC - U+06ED)
        .replace(/[\u0670\u0656\u0657\u0658\u06E5\u06E6\u06DC-\u06ED]/g, "")
        // 3. Remove specialized Uthmani characters like '۬' (U+06EC) and 'ۭ'
        .replace(/[\u06EC\u06ED]/g, "")
        // 4. Normalize Wasla Alef 'ٱ' (U+0671) to standard Alef 'ا'
        .replace(/ٱ/g, "ا")
        // 5. Normalize all Hamza variants (أ, إ, آ) to standard Alef 'ا' for flexible matching
        .replace(/[أإآ]/g, "ا")
        // 6. Normalize Alef Maqsura 'ى' to 'ي' and Taa Marbuta 'ة' to 'ه'
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .trim()
    );
  }
  
  /**
   * Extracts unique word tokens from text lines (with original Tashkeel preserved)
   * that match a clean search query term.
   */
  export function extractMatchingWords(
    fullTextLines: string[],
    query: string
  ): string[] {
    const cleanQuery = stripTashkeel(query);
    if (!cleanQuery) return [];
  
    const matchedSet = new Set<string>();
  
    fullTextLines.forEach((line) => {
      // Split line into individual words
      const words = line.trim().split(/\s+/);
      words.forEach((word) => {
        const cleanWord = stripTashkeel(word);
        // Match if the clean word contains the clean search term
        if (cleanWord.includes(cleanQuery)) {
          matchedSet.add(word); // Retain the full original Uthmani word with Tashkeel
        }
      });
    });
  
    return Array.from(matchedSet);
  }

export function normalizeQuranicMarks(text: string): string {
    if (!text) return "";
  
    return text
      // Replace Uthmani upright Damma Tanween (U+065E / U+08F1) with standard Tanween Damma (U+064C)
      .replace(/[\u065E\u08F1]/g, "\u064C")
      // Replace Wasla Alef 'ٱ' (U+0671) with standard Alef 'ا' if needed
      .replace(/ٱ/g, "ا");
  }