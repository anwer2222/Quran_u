"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { parseEdghamCsv, EdghamRecord } from "@/components/csvParser";


// interface TajweedSearchProps {
//   selectedRecitation: "hafs" | "warsh" | "sosi";
//   onAyahSelected: (
//     audioSrc: string,
//     startTime: number,
//     ayahMeta: { surah: number; ayah: number; text: string }
//   ) => void;
// }

// Media, SRT, and CSV file registry
const TAJWEED_REGISTRY: Record<
  string,
  Record<number, { audioPath: string; srtPath: string; csvPath: string; surahName: string }>
> = {
  hafs: {
    1: {
        surahName: "سورة الفاتحة",
        audioPath: "/audio/001_maher.mp3",
        srtPath: "/001_hafas.srt",
      csvPath: "/001_edgham.csv",
    },
    2: {
      surahName: "سورة لقمان",
      audioPath: "/audio/031_maher.mp3",
      srtPath: "/031_hafas.srt",
      csvPath: "/031_edgham.csv",
    },
  },
  warsh: {
    1: {
      surahName: "سورة الفاتحة",
      audioPath: "/audio/001_baset.mp3",
      srtPath: "/001_warsh.srt",
      csvPath: "/001_edgham.csv",
    },
    2: {
      surahName: "سورة لقمان",
      audioPath: "/audio/031_baset.mp3",
      srtPath: "/031_warsh.srt",
      csvPath: "/031_edgham.csv",
    },
  },
  sosi: {
    1: {
        surahName: "الفاتحة",
        audioPath: "/audio/001_rashed.mp3",
        srtPath: "/001_rashed.srt",
        csvPath: "/001_edgham.csv",
      },
      2: {
        surahName: "لقمان",
        audioPath: "/audio/031_rashed.mp3",
        srtPath: "/031_rashed.srt",
        csvPath: "/031_edgham.csv",
      },
  }
};

interface TajweedSearchProps {
  selectedRecitation: "hafs" | "warsh" | "sosi";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string }
  ) => void;
}

// Available Surahs for scope filtering
const AVAILABLE_SURAHS = [
  { id: "all", name: "القرآن كاملاً" },
  { id: "1", name: "سورة الفاتحة (1)" },
  { id: "2", name: "سورة لقمان (2)" },
];

export default function TajweedSearch({
  selectedRecitation,
  onAyahSelected,
}: TajweedSearchProps) {
  // Scope selection (Defaults to "all" for global Quran search)
  const [selectedSurahScope, setSelectedSurahScope] = useState<string>("all");

  // Global Datasets
  const [globalEdghamRecords, setGlobalEdghamRecords] = useState<EdghamRecord[]>([]);
  const [srtCache, setSrtCache] = useState<Record<number, AyahCue[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Selected letter pair filter (e.g., "م - م")
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  // 1. Fetch the unified global CSV dataset when recitation changes
  useEffect(() => {
    async function loadGlobalEdghamData() {
      setLoading(true);
      setSelectedPair(null);

      try {
        const csvPath = `/edgham.csv`; // ${selectedRecitation}_
        const res = await fetch(csvPath);
        const csvText = await res.text();
        const parsedRecords = parseEdghamCsv(csvText);

        setGlobalEdghamRecords(parsedRecords);
      } catch (err) {
        console.error("خطأ أثناء تحميل قاعدة بيانات التجويد الكلية:", err);
      } finally {
        setLoading(false);
      }
    }

    loadGlobalEdghamData();
  }, [selectedRecitation]);

  // 2. Filter active scope (All Surahs vs. Single Selected Surah)
  const activeScopeRecords =
    selectedSurahScope === "all"
      ? globalEdghamRecords
      : globalEdghamRecords.filter(
          (r) => r.surahNumber === parseInt(selectedSurahScope, 10)
        );

  // Extract unique letter pairs available in current scope
  const availablePairs = Array.from(
    new Set(activeScopeRecords.map((r) => r.letterPair))
  );

  // Active matching records for selected letter pair
  const activeMatches = selectedPair
    ? activeScopeRecords.filter((r) => r.letterPair === selectedPair)
    : [];

  // 3. Helper to load and cache SRT timestamps dynamically per Surah
  const getOrFetchSrtCues = async (surahNum: number): Promise<AyahCue[]> => {
    if (srtCache[surahNum]) {
      return srtCache[surahNum];
    }

    try {
      const srtPath = `/${surahNum===1?"001":"031"}_${selectedRecitation}.srt`;
      const res = await fetch(srtPath);
      const srtText = await res.text();
      const parsed = parseSrt(srtText);

      setSrtCache((prev) => ({ ...prev, [surahNum]: parsed }));
      return parsed;
    } catch (err) {
      console.error(`خطأ أثناء تحميل ملف SRT للسورة ${surahNum}:`, err);
      return [];
    }
  };

  // 4. Handle clicking on an Edgham result
  const handleRecordClick = async (record: EdghamRecord) => {
    const audioPath = `/audio/${record.surahNumber===1?"001":"031"}_${selectedRecitation}.mp3`;
    const cues = await getOrFetchSrtCues(record.surahNumber);
    const cue = cues.find((c) => c.ayahNumber === record.startAyahNumber);

    const startTime = cue ? cue.start : 0;
    const fullText = cue ? cue.text : record.snippetText;

    onAyahSelected(audioPath, startTime, {
      surah: record.surahNumber,
      ayah: record.startAyahNumber,
      text: fullText,
    });
  };

  /**
   * Helper to render full Ayah text from cached SRT with highlighted Edgham words
   */
  const renderHighlightedAyahText = (record: EdghamRecord) => {
    const currentCues = srtCache[record.surahNumber] || [];

    // Single Ayah occurrence
    if (!record.secondAyahNumber) {
      const cue = currentCues.find((c) => c.ayahNumber === record.startAyahNumber);
      if (!cue) return record.snippetText;

      const words = cue.text.split(/\s+/);
      const [idx1, idx2] = record.wordLocations;

      return (
        <span className="leading-loose font-mono">
          {words.map((word, wIdx) => {
            const isHighlighted = wIdx === idx1 || wIdx === idx2;
            return (
              <React.Fragment key={wIdx}>
                <span
                  className={
                    isHighlighted
                      ? "bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded-sm border border-amber-400"
                      : ""
                  }
                >
                  {word}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </span>
      );
    }

    // Cross-Ayah occurrence (Location "0 - 0" -> last word of Ayah 1 & first word of Ayah 2)
    const cue1 = currentCues.find((c) => c.ayahNumber === record.startAyahNumber);
    const cue2 = currentCues.find((c) => c.ayahNumber === record.secondAyahNumber);

    if (!cue1 || !cue2) return record.snippetText;

    const words1 = cue1.text.split(/\s+/);
    const words2 = cue2.text.split(/\s+/);

    return (
      <span className="leading-loose font-mono">
        {/* Ayah 1 */}
        {words1.map((word, wIdx) => {
          const isHighlighted = wIdx === words1.length - 1;
          return (
            <React.Fragment key={`a1_${wIdx}`}>
              <span
                className={
                  isHighlighted
                    ? "bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded-sm border border-amber-400"
                    : ""
                }
              >
                {word}
              </span>{" "}
            </React.Fragment>
          );
        })}
        <span className="text-xs font-mono text-primary font-bold px-1">
          ([{record.startAyahNumber}])
        </span>{" "}
        {/* Ayah 2 */}
        {words2.map((word, wIdx) => {
          const isHighlighted = wIdx === 0;
          return (
            <React.Fragment key={`a2_${wIdx}`}>
              <span
                className={
                  isHighlighted
                    ? "bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded-sm border border-amber-400"
                    : ""
                }
              >
                {word}
              </span>{" "}
            </React.Fragment>
          );
        })}
      </span>
    );
  };

  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4"
      dir="rtl"
    >
      <h3 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
        طريقة البحث الثالثة: أحكام التجويد (البحث الشامل)
      </h3>

      {/* Scope Selector */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          نطاق البحث
        </label>
        <select
          value={selectedSurahScope}
          onChange={(e) => {
            setSelectedSurahScope(e.target.value);
            setSelectedPair(null);
          }}
          className="w-full p-2.5 rounded-radius border border-input bg-popover text-popover-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-serif"
        >
          {AVAILABLE_SURAHS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Letter Pairs Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          اختر الحرفين (توالي الإدغام):
        </label>

        {loading ? (
          <p className="text-xs text-muted-foreground">جاري تحميل بيانات التجويد الشاملة...</p>
        ) : availablePairs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availablePairs.map((pair) => (
              <button
                key={pair}
                onClick={async () => {
                  setSelectedPair(pair);
                  // Pre-fetch SRT cues for all matching records to enable instant text highlighting
                  const matches = activeScopeRecords.filter((r) => r.letterPair === pair);
                  for (const match of matches) {
                    await getOrFetchSrtCues(match.surahNumber);
                  }
                }}
                className={`px-4 py-2 rounded-radius text-sm font-bold font-mono border transition-all ${
                  selectedPair === pair
                    ? "bg-accent text-accent-foreground border-accent shadow"
                    : "bg-popover text-popover-foreground border-input hover:bg-accent/40"
                }`}
              >
                حرفا ({pair})
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            لا توجد مواضع إدغام مسجلة لهذا النطاق.
          </p>
        )}
      </div>

      {/* Match Results Listing */}
      {selectedPair && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>مواضع الإدغام للحرفين ({selectedPair}):</span>
            <span className="font-mono text-primary font-bold">
              عدد المواضع: {activeMatches.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pl-1">
            {activeMatches.map((record, index) => (
              <button
                key={`${record.surahNumber}_${record.startAyahNumber}_${index}`}
                onClick={() => handleRecordClick(record)}
                className="w-full p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border hover:bg-accent/20 transition-colors flex flex-col gap-2 items-start"
              >
                {/* Metadata Badges */}
                <div className="w-full flex justify-between items-center text-xs font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      سورة [{record.surahNumber}] - الآية: [{record.ayahNumberRange}]
                    </span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius text-[10px]">
                      {record.type}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-sans">
                    مرجع الشرح: صـ {record.refPageNumber}
                  </span>
                </div>

                {/* Full Ayah from SRT with Colored Edgham */}
                <div className="text-base font-mono text-foreground w-full leading-relaxed">
                  {renderHighlightedAyahText(record)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}