export interface EdghamRecord {
    textSnippet: string;
    ayahNumberRange: string; // e.g., "13" or "3 - 4"
    startAyahNumber: number; // Extracted first Ayah number for media lookup
    letterPair: string;      // e.g., "م - م" or "ل - ل"
    pageNumber: number;
  }
  
  export function parseEdghamCsv(csvContent: string): EdghamRecord[] {
    const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
    const records: EdghamRecord[] = [];
  
    for (const line of lines) {
      if (!line.trim()) continue;
  
      // Split by comma
      const parts = line.split(",").map((p) => p.trim());
  
      if (parts.length >= 4) {
        const textSnippet = parts[0];
        const ayahNumberRange = parts[1];
        const letterPair = parts[2];
        const pageNumber = parseInt(parts[3], 10) || 0;
  
        // Extract the primary starting Ayah number (e.g. "3 - 4" -> 3)
        const firstAyahMatch = ayahNumberRange.match(/\d+/);
        const startAyahNumber = firstAyahMatch ? parseInt(firstAyahMatch[0], 10) : 1;
  
        records.push({
          textSnippet,
          ayahNumberRange,
          startAyahNumber,
          letterPair,
          pageNumber,
        });
      }
    }
  
    return records;
  }