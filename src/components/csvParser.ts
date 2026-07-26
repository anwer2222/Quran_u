export interface EdghamRecord {
    snippetText: string;
    ayahNumberRange: string;  // e.g., "13" or "3 - 4"
    startAyahNumber: number;  // Primary Ayah index for SRT timing
    secondAyahNumber?: number; // Secondary Ayah index if Edgham spans across 2 Ayahs
    letterPair: string;       // e.g., "م - م"
    refPageNumber: number;    // Reference page number explaining this example
    type: string;             // "متماثلان" | "متجانسان"
    wordLocations: number[];  // Array of 0-based word indexes within the Ayah(s)
  }
  
  export function parseEdghamCsv(csvContent: string): EdghamRecord[] {
    const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
    const records: EdghamRecord[] = [];
  
    for (const line of lines) {
      if (!line.trim()) continue;
  
      // Split CSV fields
      const parts = line.split(",").map((p) => p.trim());
  
      if (parts.length >= 6) {
        const snippetText = parts[0];
        const ayahNumberRange = parts[1];
        const letterPair = parts[2];
        const refPageNumber = parseInt(parts[3], 10) || 0;
        const type = parts[4];
        const locationStr = parts[5];
  
        // Parse Ayah numbers (handles "13" or "3 - 4")
        const ayahMatches = ayahNumberRange.match(/\d+/g);
        const startAyahNumber = ayahMatches ? parseInt(ayahMatches[0], 10) : 1;
        const secondAyahNumber = ayahMatches && ayahMatches.length > 1 ? parseInt(ayahMatches[1], 10) : undefined;
  
        // Parse word locations (e.g., "0 - 0" or "2 - 3" -> [0, 0] or [2, 3])
        const wordLocations = locationStr.split("-").map((loc) => parseInt(loc.trim(), 10));
  
        records.push({
          snippetText,
          ayahNumberRange,
          startAyahNumber,
          secondAyahNumber,
          letterPair,
          refPageNumber,
          type,
          wordLocations,
        });
      }
    }
  
    return records;
  }