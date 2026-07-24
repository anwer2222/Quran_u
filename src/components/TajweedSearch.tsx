"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { parseEdghamCsv, EdghamRecord } from "@/components/csvParser";

interface TajweedSearchProps {
  selectedRecitation: "hafs" | "warsh";
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
};

export default function TajweedSearch({
  selectedRecitation,
  onAyahSelected,
}: TajweedSearchProps) {
  const [selectedSurah, setSelectedSurah] = useState<string>("1");
  const [edghamRecords, setEdghamRecords] = useState<EdghamRecord[]>([]);
  const [ayahCues, setAyahCues] = useState<AyahCue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Selected letter pair (e.g. "م - م")
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  const currentSurahNum = parseInt(selectedSurah, 10);
  const currentRegistry =
    TAJWEED_REGISTRY[selectedRecitation]?.[currentSurahNum] ||
    TAJWEED_REGISTRY["hafs"][1];

  // Fetch CSV and SRT files when Surah or Recitation changes
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

  // Extract unique letter pairs for selector buttons
  const availablePairs = Array.from(
    new Set(edghamRecords.map((r) => r.letterPair))
  );

  // Filter records matching the active pair
  const activeMatches = selectedPair
    ? edghamRecords.filter((r) => r.letterPair === selectedPair)
    : [];

  // Trigger jump to target audio timestamp
  const handleRecordClick = (record: EdghamRecord) => {
    const cue = ayahCues.find((c) => c.ayahNumber === record.startAyahNumber);
    const startTime = cue ? cue.start : 0;

    onAyahSelected(currentRegistry.audioPath, startTime, {
      surah: currentSurahNum,
      ayah: record.startAyahNumber,
      text: record.textSnippet,
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

      {/* Surah Scope Selection */}
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
          <option value="2">سورة البقرة (2)</option>
        </select>
      </div>

      {/* Letter Pairs Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted-foreground">
          اختر علاقة الأحرف (توالي الإدغام):
        </label>

        {loading ? (
          <p className="text-xs text-muted-foreground">جاري تحميل حالات الإدغام...</p>
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
            لا توجد بيانات إدغام مسجلة لهذه السورة.
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
                className="w-full p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border hover:bg-accent/20 transition-colors flex flex-col gap-1 items-start"
              >
                <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-primary">
                  <span>الآية/الآيات: [{record.ayahNumberRange}]</span>
                  <span className="text-muted-foreground">صفحة المصحف: {record.pageNumber}</span>
                </div>
                <span className="text-base font-serif text-foreground w-full">
                  {record.textSnippet}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}