"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { normalizeQuranicMarks } from "./arabicUtils";

interface SurahAyahSearchProps {
  selectedRecitation: "hafs" | "warsh" | "sosi";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string, tfseer:string }
  ) => void;
}

// Map the 4 MP3s and 4 SRT files for 2 Recitations across 2 Surahs
const MEDIA_REGISTRY: Record<
  string,
  Record<number, { audioPath: string; srtPath: string; surahName: string }>
> = {
  hafs: {
    1: {
      surahName: "الفاتحة (1)",
      audioPath: "/audio/001_hafs.mp3",
      srtPath: "/001_hafs.srt",
    },
    2: {
      surahName: "لقمان (2)",
      audioPath: "/audio/031_hafs.mp3",
      srtPath: "/031_hafs.srt",
    },
  },
  warsh: {
    1: {
      surahName: "الفاتحة (1)",
      audioPath: "/audio/001_warsh.mp3",
      srtPath: "/001_warsh.srt",
    },
    2: {
      surahName: "لقمان (2)",
      audioPath: "/audio/031_warsh.mp3",
      srtPath: "/031_warsh.srt",
    },
  },
  sosi: {
    1: {
      surahName: "الفاتحة (1)",
      audioPath: "/audio/001_sosi.mp3",
      srtPath: "/001_sosi.srt",
    },
    2: {
      surahName: "لقمان (2)",
      audioPath: "/audio/031_sosi.mp3",
      srtPath: "/031_sosi.srt",
    },
  }
};


export default function SurahAyahSearch({
  selectedRecitation,
  onAyahSelected,
}: SurahAyahSearchProps) {
  const [selectedSurah, setSelectedSurah] = useState<string>("1");
  const [selectedAyah, setSelectedAyah] = useState<string>("");
  const [ayahCues, setAyahCues] = useState<AyahCue[]>([]);
  const [loadingSrt, setLoadingSrt] = useState<boolean>(false);

  const currentSurahNum = parseInt(selectedSurah, 10);
  const currentMedia =
    MEDIA_REGISTRY[selectedRecitation]?.[currentSurahNum] ||
    MEDIA_REGISTRY["hafs"][1];

  useEffect(() => {
    async function loadTargetSrt() {
      if (!currentMedia) return;
      setLoadingSrt(true);
      setSelectedAyah("");

      try {
        const response = await fetch(currentMedia.srtPath);
        const srtText = await response.text();
        const parsedCues = parseSrt(srtText);
        setAyahCues(parsedCues);
      } catch (err) {
        console.error("خطأ أثناء تحميل ملف التوقيت SRT:", err);
      } finally {
        setLoadingSrt(false);
      }
    }

    loadTargetSrt();
  }, [selectedRecitation, selectedSurah]);

  // Helper function to extract the first 4 words of an Ayah transcript
  const getFirstFourWords = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= 4) return text;
    return words.slice(0, 4).join(" ");
  };

  const handleAyahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ayahNumStr = e.target.value;
    setSelectedAyah(ayahNumStr);

    if (!ayahNumStr) return;

    const targetAyahNum = parseInt(ayahNumStr, 10);
    const matchedCue = ayahCues.find((c) => c.ayahNumber === targetAyahNum);

    if (matchedCue) {
      onAyahSelected(currentMedia.audioPath, matchedCue.start, {
        surah: currentSurahNum,
        ayah: matchedCue.ayahNumber,
        text: matchedCue.text,
        tfseer: matchedCue.text,
      });
    }
  };

   // Fetch global Edgham CSV data
  //  const csvPath = `/tfseer.csv`;
  //  const csvRes = await fetch(csvPath);
  //  const csvText = await csvRes.text();
  //  const parsedRecords = parseEdghamCsv(csvText);

  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4"
      dir="rtl"
    >
      <h3 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
        طريقة البحث الأولى: التصفح بالسورة والآية
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* اختيار السورة */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            اختر السورة
          </label>
          <select
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(e.target.value)}
            className="w-full p-2.5 rounded-radius border border-input bg-popover text-popover-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="1">سورة الفاتحة (1)</option>
            <option value="2">سورة لقمان (2)</option>
          </select>
        </div>

        {/* اختيار الآية بالصيغة المطلوبة: [first 4 words] ... [Ayah number] */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            اختر الآية
          </label>
          <select
            value={selectedAyah}
            onChange={handleAyahChange}
            disabled={loadingSrt || ayahCues.length === 0}
            className="w-full p-2.5 rounded-radius border border-input bg-popover text-popover-foreground text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          >
            <option value="">
              {loadingSrt
                ? "جاري تحليل توقيت الآيات..."
                : "-- اختر الآية --"}
            </option>
            {ayahCues.map((cue) => {
              const previewWords = getFirstFourWords(cue.text);
              return (
                <option key={cue.ayahNumber} value={cue.ayahNumber}>
                  {normalizeQuranicMarks(previewWords)} ... [{cue.ayahNumber}]
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}