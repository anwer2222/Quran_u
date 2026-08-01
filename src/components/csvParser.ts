export interface EdghamRecord {
  surahNumber: number;
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

    if (parts.length >= 7) {
      const surahNumber = parseInt(parts[0], 10) || 1;
      const snippetText = parts[1];
      const ayahNumberRange = parts[2];
      const letterPair = parts[3];
      const refPageNumber = parseInt(parts[4], 10) || 0;
      const type = parts[5];
      const locationStr = parts[6];

      // Parse Ayah numbers (handles "13" or "3 - 4")
      const ayahMatches = ayahNumberRange.match(/\d+/g);
      const startAyahNumber = ayahMatches ? parseInt(ayahMatches[0], 10) : 1;
      const secondAyahNumber = ayahMatches && ayahMatches.length > 1 ? parseInt(ayahMatches[1], 10) : undefined;

      // Parse word locations (e.g., "0 - 0" or "2 - 3" -> [0, 0] or [2, 3])
      const wordLocations = locationStr.split("-").map((loc) => parseInt(loc.trim(), 10));

      records.push({
        surahNumber,
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

// export interface TfseerRecord {
//   surahNumber: number;
//   ayahNumber: number;
//   ayah: string;
//   tfseer: string;
// }

// export function parseTfseerCsv(csvContent: string): TfseerRecord[] {
//   const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
//   const records: TfseerRecord[] = [];

//   for (const line of lines) {
//     if (!line.trim()) continue;

//     // Split CSV fields
//     const parts = line.split(",").map((p) => p.trim());

//     if (parts.length >= 3) {
//       const surahNumber = parseInt(parts[0], 10) || 1;
//       const ayahNumber = parseInt(parts[1], 10) || 1;
//       const ayah = parts[2];
//       const tfseer = parts[3];

//       records.push({
//         surahNumber,
//         ayahNumber,
//         ayah,
//         tfseer,
//       });
//     }
//   }

//   return records;
// }