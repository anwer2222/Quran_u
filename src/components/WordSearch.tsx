"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { stripTashkeel, extractMatchingWords, normalizeQuranicMarks } from "@/components/arabicUtils";

interface WordSearchProps {
  selectedRecitation: "hafs" | "warsh" | "sosi";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string }
  ) => void;
}

interface QuranAyahRecord {
  surah: number;
  ayah: number;
  text: string;
}

const AVAILABLE_SURAHS = [
  { id: "all", name: "القرآن كاملاً" },
  { id: "1", name: "سورة الفاتحة (1)" },
  { id: "2", name: "سورة لقمان (2)" },
];

export default function WordSearch({
  selectedRecitation,
  onAyahSelected,
}: WordSearchProps) {
  const [selectedSurahScope, setSelectedSurahScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [quranData, setQuranData] = useState<QuranAyahRecord[]>([]);
  // Stores pre-loaded SRT cues keyed by Surah number
  const [srtDataStore, setSrtDataStore] = useState<Record<number, AyahCue[]>>({});
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const [suggestedWords, setSuggestedWords] = useState<string[]>([]);
  const [selectedTashkeelWord, setSelectedTashkeelWord] = useState<string | null>(null);

  // Pre-load Quran JSON and SRT timing files together
  useEffect(() => {
    async function loadAllResources() {
      setLoadingData(true);
      setSelectedTashkeelWord(null);
      setSearchQuery("");
      setSuggestedWords([]);

      try {
        // 1. Fetch full Quran text
        const textRes = await fetch(`/full_${selectedRecitation}.json`);
        const textData: QuranAyahRecord[] = await textRes.json();

        const normalizedData = textData.map((item) => ({
          ...item,
          text: normalizeQuranicMarks(item.text),
        }));
        setQuranData(normalizedData);

        // 2. Pre-fetch SRT files for Surahs 1 and 2 in advance
        const surahIds = [1, 2];
        const loadedSrtStore: Record<number, AyahCue[]> = {};

        await Promise.all(
          surahIds.map(async (sId) => {
            try {
              const res = await fetch(`/${sId===1?"001":"031"}_${selectedRecitation}.srt`);
              const srtText = await res.text();
              loadedSrtStore[sId] = parseSrt(srtText);
            } catch (e) {
              console.error(`Could not pre-load SRT for Surah ${sId}:`, e);
            }
          })
        );

        setSrtDataStore(loadedSrtStore);
      } catch (err) {
        console.error("Error loading resources for WordSearch:", err);
      } finally {
        setLoadingData(false);
      }
    }

    loadAllResources();
  }, [selectedRecitation]);

  const activeScopeAyahs =
    selectedSurahScope === "all"
      ? quranData
      : quranData.filter((item) => Number(item.surah) === Number(selectedSurahScope));

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedTashkeelWord(null);

    if (query.trim()) {
      const textLines = activeScopeAyahs.map((a) => a.text);
      const matches = extractMatchingWords(textLines, query);
      setSuggestedWords(matches);
    } else {
      setSuggestedWords([]);
    }
  };

  // Synchronous, rock-solid click handler
  const handleAyahResultClick = (item: QuranAyahRecord) => {
    const surahNum = Number(item.surah);
    const ayahNum = Number(item.ayah);

    const audioPath = `/audio/${surahNum===1?"001":"031"}_${selectedRecitation}.mp3`;
    const surahCues = srtDataStore[surahNum] || [];

    // Safe matching with type coercion
    const cue = surahCues.find((c) => Number(c.ayahNumber) === ayahNum);

    if (!cue) {
      console.warn(`Timestamp not found for Surah ${surahNum}, Ayah ${ayahNum}`);
      return;
    }

    onAyahSelected(audioPath, cue.start, {
      surah: surahNum,
      ayah: ayahNum,
      text: item.text,
    });
  };

  const matchingAyahs = selectedTashkeelWord
    ? activeScopeAyahs.filter((item) => item.text.includes(selectedTashkeelWord))
    : [];

  return (
    <div
      className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4"
      dir="rtl"
    >
      <h3 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
        طريقة البحث الثانية: البحث بالكلمة والتشكيل (البحث الشامل)
      </h3>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          نطاق البحث
        </label>
        <select
          value={selectedSurahScope}
          onChange={(e) => {
            setSelectedSurahScope(e.target.value);
            setSelectedTashkeelWord(null);
            setSuggestedWords([]);
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

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          أدخل الكلمة القرآنية للبحث (بدون تشكيل أو بتشكيل جزئي)
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleQueryChange}
          disabled={loadingData}
          placeholder="مثال: الناس، الصراط، رحيم، قالوا..."
          className="w-full p-3 font-serif rounded-radius border border-input bg-popover text-popover-foreground text-right focus:outline-none focus:ring-2 focus:ring-ring text-base"
        />
      </div>

      {suggestedWords.length > 0 && (
        <div className="p-3 bg-muted rounded-radius border border-border space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            اختر اللفظ بالتشكيل الدقيق المقترن بالمصحف:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedWords.map((word, idx) => (
              <button
                key={`${word}_${idx}`}
                onClick={() => setSelectedTashkeelWord(word)}
                className={`px-3 py-1.5 rounded-radius text-lg font-mono border transition-all ${
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

      {selectedTashkeelWord && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>الآيات التي تحتوي اللفظ ({selectedTashkeelWord}):</span>
            <span className="font-mono text-primary font-bold">
              عدد النتائج: {matchingAyahs.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pl-1">
            {matchingAyahs.length > 0 ? (
              matchingAyahs.map((item) => (
                <button
                  key={`${item.surah}_${item.ayah}`}
                  onClick={() => handleAyahResultClick(item)}
                  className="w-full p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border hover:bg-accent/20 transition-colors flex flex-col items-start gap-1"
                >
                  <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-primary">
                    <span>سورة رقم [{item.surah}]</span>
                    <span>الآية رقم [{item.ayah}]</span>
                  </div>
                  <span className="text-base font-mono text-foreground w-full leading-relaxed">
                    {item.text}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground p-2 text-center">
                لا توجد نتائج مطابقة لهذا اللفظ في النطاق المحدد.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}