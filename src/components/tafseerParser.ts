export type TafseerMap = Record<string, string>; // Key: "surah:ayah", Value: "Tafseer Text"

/**
 * Parses a 3-column CSV (<surahNumber>,<ayahNumber>,<Tafseer>)
 * Returns a key-value dictionary for instant O(1) lookups.
 */
export function parseTafseerCsv(csvContent: string): TafseerMap {
  const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
  const map: TafseerMap = {};

  for (const line of lines) {
    if (!line.trim()) continue;

    // Split CSV by comma (handling basic CSV format)
    const firstComma = line.indexOf(",");
    const secondComma = line.indexOf(",", firstComma + 1);
    const trdComma = line.indexOf(",", secondComma + 1);

    if (firstComma !== -1 && secondComma !== -1) {
      const surahStr = line.substring(0, firstComma).trim();
      const ayahStr = line.substring(firstComma + 1, secondComma).trim();
      let tafseerText = line.substring(trdComma + 1).trim();

      // Clean surrounding quotes if present in CSV
      if (tafseerText.includes('"')){// if (tafseerText.startsWith('"') && tafseerText.endsWith('"')) {
        tafseerText = tafseerText.slice(1, -1).replace(/"/g, '');
      }

      let surahNum = parseInt(surahStr, 10);
      const ayahNum = parseInt(ayahStr, 10);
 
      surahNum = surahNum===3?2:surahNum


      if (!isNaN(surahNum) && !isNaN(ayahNum)) {
        const key = `${surahNum}:${ayahNum}`;
        map[key] = tafseerText;
      }
    }
  }

  return map;
}