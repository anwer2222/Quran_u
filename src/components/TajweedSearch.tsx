"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { parseEdghamCsv, EdghamRecord } from "@/components/csvParser";

interface TajweedSearchProps {
  selectedRecitation: "hafs" | "warsh" | "sosi";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string }
  ) => void;
}

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
      srtPath: "/001_warash.srt",
      csvPath: "/001_edgham.csv",
    },
    2: {
      surahName: "سورة لقمان",
      audioPath: "/audio/031_baset.mp3",
      srtPath: "/031_warash.srt",
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

export default function TajweedSearch({
  selectedRecitation,
  onAyahSelected,
}: TajweedSearchProps) {
  const [selectedSurah, setSelectedSurah] = useState<string>("1");
  const [edghamRecords, setEdghamRecords] = useState<EdghamRecord[]>([]);
  const [ayahCues, setAyahCues] = useState<AyahCue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Active filters
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const currentSurahNum = parseInt(selectedSurah, 10);
  const currentRegistry =
    TAJWEED_REGISTRY[selectedRecitation]?.[currentSurahNum] ||
    TAJWEED_REGISTRY["hafs"][1];

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      setSelectedPair(null);

      try {
        const [csvRes, srtRes] = await Promise.all([
          fetch(currentRegistry.csvPath),
          fetch(currentRegistry.srtPath),
        ]);

        const csvText = await csvRes.text();
        const srtText = await srtRes.text();

        setEdghamRecords(parseEdghamCsv(csvText));
        setAyahCues(parseSrt(srtText));
      } catch (err) {
        console.error("خطأ أثناء تحميل ملفات التجويد والتوقيت:", err);
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [selectedRecitation, selectedSurah]);

  const availablePairs = Array.from(new Set(edghamRecords.map((r) => r.letterPair)));
  const activeMatches = selectedPair
    ? edghamRecords.filter((r) => r.letterPair === selectedPair)
    : [];

  /**
   * Helper to render full Ayah text from SRT with highlighted Edgham words
   */
  const renderHighlightedAyahText = (record: EdghamRecord) => {
    // Single Ayah occurrence
    if (!record.secondAyahNumber) {
      const cue = ayahCues.find((c) => c.ayahNumber === record.startAyahNumber);
      if (!cue) return record.snippetText;

      const words = cue.text.split(/\s+/);
      const [idx1, idx2] = record.wordLocations;

      return (
        <span className="leading-loose">
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
    const cue1 = ayahCues.find((c) => c.ayahNumber === record.startAyahNumber);
    const cue2 = ayahCues.find((c) => c.ayahNumber === record.secondAyahNumber);

    if (!cue1 || !cue2) return record.snippetText;

    const words1 = cue1.text.split(/\s+/);
    const words2 = cue2.text.split(/\s+/);

    return (
      <span className="leading-loose">
        {/* Render Ayah 1 */}
        {words1.map((word, wIdx) => {
          const isHighlighted = wIdx === words1.length - 1; // Last word of Ayah 1
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
        {/* Render Ayah 2 */}
        {words2.map((word, wIdx) => {
          const isHighlighted = wIdx === 0; // First word of Ayah 2
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

  const handleRecordClick = (record: EdghamRecord) => {
    const cue = ayahCues.find((c) => c.ayahNumber === record.startAyahNumber);
    const startTime = cue ? cue.start : 0;
    const fullText = cue ? cue.text : record.snippetText;

    onAyahSelected(currentRegistry.audioPath, startTime, {
      surah: currentSurahNum,
      ayah: record.startAyahNumber,
      text: fullText,
    });
  };

  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4"
      dir="rtl"
    >
      <h3 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
        طريقة البحث الثالثة: أحكام التجويد (الإدغام)
      </h3>

      {/* Surah Selection */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          نطاق البحث (السورة)
        </label>
        <select
          value={selectedSurah}
          onChange={(e) => setSelectedSurah(e.target.value)}
          className="w-full p-2.5 rounded-radius border border-input bg-popover text-popover-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-serif"
        >
          <option value="1">سورة الفاتحة (1)</option>
          <option value="2">سورة لقمان (2)</option>
        </select>
      </div>

      {/* Letter Pairs Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          اختر الحرفين (توالي الإدغام):
        </label>

        {loading ? (
          <p className="text-xs text-muted-foreground">جاري تحميل بيانات التجويد...</p>
        ) : availablePairs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {availablePairs.map((pair) => (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
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
            لا توجد مواضع إدغام مجهزة لهذه السورة.
          </p>
        )}
      </div>

      {/* Match Results Listing */}
      {selectedPair && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            مواضع الإدغام للحرفين ({selectedPair}):
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2 pl-1">
            {activeMatches.map((record, index) => (
              <button
                key={`${record.startAyahNumber}_${index}`}
                onClick={() => handleRecordClick(record)}
                className="w-full p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border hover:bg-accent/20 transition-colors flex flex-col gap-2 items-start"
              >
                {/* Metadata Badges */}
                <div className="w-full flex justify-between items-center text-xs font-mono font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">الآية: [{record.ayahNumberRange}]</span>
                    <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius text-[10px]">
                      {record.type}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-sans">
                    مرجع الشرح: صـ {record.refPageNumber}
                  </span>
                </div>

                {/* Full Ayah from SRT with Colored Edgham */}
                <div className="text-base font-mono text-foreground w-full">
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