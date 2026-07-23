// Remove Tashkeel/Harakat for clean matching
export function stripTashkeel(text: string): string {
    return text.replace(/[\u064B-\u065F\u0670]/g, "");
  }
  
  // Extract unique word tokens with Tashkeel matching a clean query term
  export function extractMatchingWords(fullTextLines: string[], query: string): string[] {
    const cleanQuery = stripTashkeel(query.trim());
    if (!cleanQuery) return [];
  
    const matchedSet = new Set<string>();
  
    fullTextLines.forEach((line) => {
      const words = line.trim().split(/\s+/);
      words.forEach((word) => {
        const cleanWord = stripTashkeel(word);
        if (cleanWord.includes(cleanQuery)) {
          matchedSet.add(word); // Store the original word with Tashkeel
        }
      });
    });
  
    return Array.from(matchedSet);
  }