export interface AyahCue {
    ayahNumber: number;
    start: number; // Start time in seconds
    end: number;   // End time in seconds
    text: string;  // Verse transcript text
  }
  
  // Convert SRT time code (HH:MM:SS,mmm) into total seconds
  function parseTimeToSeconds(timeString: string): number {
    const [hms, milli] = timeString.split(",");
    const [hours, minutes, seconds] = hms.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds + parseInt(milli || "0", 10) / 1000;
  }
  
  export function parseSrt(srtContent: string): AyahCue[] {
    const cleaned = srtContent.replace(/\r\n/g, "\n");
    const blocks = cleaned.split(/\n\s*\n/);
    const cues: AyahCue[] = [];
  
    for (const block of blocks) {
      const lines = block.split("\n");
      if (lines.length >= 3) {
        const ayahNumber = parseInt(lines[0].trim(), 10);
        const timeMatch = lines[1].match(/([\d:,]+)\s*-->\s*([\d:,]+)/);
        if (timeMatch) {
          const start = parseTimeToSeconds(timeMatch[1]);
          const end = parseTimeToSeconds(timeMatch[2]);
          const text = lines.slice(2).join(" ").trim();
          cues.push({ ayahNumber, start, end, text });
        }
      }
    }
    return cues;
  }