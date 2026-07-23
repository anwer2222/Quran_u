"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { stripTashkeel, extractMatchingWords } from "@/components/arabicUtils";

interface WordSearchProps {
  selectedRecitation: "hafs" | "warsh";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string }
  ) => void;
}

// Media and Text registry for the 4 combinations
const MEDIA_TEXT_REGISTRY: Record<
  string,
  Record<number, { audioPath: string; srtPath: string; txtPath: string; surahName: string }>
> = {
  hafs: {
    1: {
      surahName: "سورة الفاتحة",
      audioPath: "/audio/001_maher.mp3",
      srtPath: "/001_hafas.srt",
      txtPath: "/001_hafas.txt",
    },
    2: {
      surahName: "سورة البقرة",
      audioPath: "/audio/031_maher.mp3",
      srtPath: "/031_hafas.srt",
      txtPath: "/031_hafas.txt",
    },
  },
  warsh: {
    1: {
      surahName: "سورة الفاتحة",
      audioPath: "/audio/001_baset.mp3",
      srtPath: "/001_warash.srt",
      txtPath: "/001_warash.txt",
    },
    2: {
      surahName: "سورة البقرة",
      audioPath: "/audio/031_baset.mp3",
      srtPath: "/031_warash.srt",
      txtPath: "/031_warash.srt",
    },
  },
};

export default function WordSearch({
  selectedRecitation,
  onAyahSelected,
}: WordSearchProps) {
  const [selectedSurah, setSelectedSurah] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Data state
  const [txtLines, setTxtLines] = useState<string[]>([]);
  const [ayahCues, setAyahCues] = useState<AyahCue[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Selection state
  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [selectedTashkeelWord, setSelectedTashkeelWord] = useState<string | null>(null);

  const currentSurahNum = parseInt(selectedSurah, 10);
  const currentRegistry =
    MEDIA_TEXT_REGISTRY[selectedRecitation]?.[currentSurahNum] ||
    MEDIA_TEXT_REGISTRY["hafs"][1];

  // Load both .txt and .srt files when Surah or Recitation changes
  useEffect(() => {
    async function loadResources() {
      setLoadingData(true);
      setSelectedTashkeelWord(null);
      setSearchQuery("");

      try {
        const [txtRes, srtRes] = await Promise.all([
          fetch(currentRegistry.txtPath),
          fetch(currentRegistry.srtPath),
        ]);

        const txtRaw = await txtRes.text();
        const srtRaw = await srtRes.text();

        // Split .txt file by line (each line is one Ayah)
        const lines = txtRaw
          .replace(/\r\n/g, "\n")
          .split("\n")
          .filter((line) => line.trim().length > 0);

        setTxtLines(lines);
        setAyahCues(parseSrt(srtRaw));
      } catch (err) {
        console.error("خطأ أثناء تحميل ملفات النص والتوقيت:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadResources();
  }, [selectedRecitation, selectedSurah]);

  // Handle typing search query
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedTashkeelWord(null);

    if (query.trim()) {
      const matches = extractMatchingWords(txtLines, query);
      setSuggestedWords(matches);
    } else {
      setSuggestedWords([]);
    }
  };

  // Find all Ayahs containing the selected Tashkeel word
  const getMatchingAyahsForWord = (tashkeelWord: string) => {
    const matchedAyahs: { ayahNumber: number; text: string; start: number }[] = [];

    txtLines.forEach((lineText, index) => {
      if (lineText.includes(tashkeelWord)) {
        const ayahNum = index + 1; // Ayahs are 1-indexed line by line
        const cue = ayahCues.find((c) => c.ayahNumber === ayahNum);

        matchedAyahs.push({
          ayahNumber: ayahNum,
          text: lineText,
          start: cue ? cue.start : 0,
        });
      }
    });

    return matchedAyahs;
  };

  const matchingAyahs = selectedTashkeelWord
    ? getMatchingAyahsForWord(selectedTashkeelWord)
    : [];

  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4"
      dir="rtl"
    >
      <h3 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
        طريقة البحث الثانية: البحث بالكلمة والتشكيل
      </h3>

      {/* Surah Scope Selection */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          نطاق البحث (السورة)
        </label>
        <select
          value={selectedSurah}
          onChange={(e) => setSelectedSurah(e.target.value)}
          className="w-full p-2.5 rounded-radius border border-input bg-popover text-popover-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-serif mb-4"
        >
          <option value="1">سورة الفاتحة (1)</option>
          <option value="2">سورة البقرة (2)</option>
        </select>
      </div>

      {/* Search Input Box */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          أدخل الكلمة القرآنية (بدون تشكيل أو بتشكيل جزئي)
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleQueryChange}
          disabled={loadingData}
          placeholder="مثال: الحمد، عليم، قالوا..."
          className="w-full p-3 font-serif rounded-radius border border-input bg-popover text-popover-foreground text-right focus:outline-none focus:ring-2 focus:ring-ring text-base"
        />
      </div>

      {/* Step 1: Display matched word variants with Tashkeel */}
      {suggestedWords.length > 0 && (
        <div className="p-3 bg-muted rounded-radius border border-border space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            اختر اللفظ المطلوب بالتشكيل الدقيق:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedWords.map((word, idx) => (
              <button
                key={`${word}_${idx}`}
                onClick={() => setSelectedTashkeelWord(word)}
                className={`px-3 py-1.5 rounded-radius text-lg font-serif border transition-all ${
                  selectedTashkeelWord === word
                    ? "bg-accent text-accent-foreground border-accent shadow-sm"
                    : "bg-popover text-popover-foreground border-input hover:bg-accent/50"
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Render all Ayahs containing the selected Tashkeel word */}
      {selectedTashkeelWord && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            الآيات التي تحتوي الكلمة ({selectedTashkeelWord}):
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2 pl-1">
            {matchingAyahs.length > 0 ? (
              matchingAyahs.map((item) => (
                <button
                  key={item.ayahNumber}
                  onClick={() =>
                    onAyahSelected(currentRegistry.audioPath, item.start, {
                      surah: currentSurahNum,
                      ayah: item.ayahNumber,
                      text: item.text,
                    })
                  }
                  className="w-full p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border hover:bg-accent/20 transition-colors flex flex-col items-start gap-1"
                >
                  <span className="text-xs font-mono font-bold text-primary">
                    الآية رقم [{item.ayahNumber}]
                  </span>
                  <span className="text-base font-serif text-foreground w-full">
                    {item.text}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">لا توجد نتائج مطابقة.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}