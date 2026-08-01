"use client";

import React, { useState, useRef, useEffect } from "react";
import SurahAyahSearch from "@/components/SurahAyahSearch";
import WordSearch from "@/components/WordSearch";
import TajweedSearch from "./Taj";
import { normalizeQuranicMarks } from "./arabicUtils";
import { playAudioSegment } from "./audioHandler";
import { parseTafseerCsv, TafseerMap } from "@/components/tafseerParser";

interface ActiveAyahMeta {
  surah: number;
  ayah: number;
  text: string;
  tfseer: string;
  startTime: number;
}

export default function QuranSearchPage() {
  // 1. Global Recitation State
  const [globalRecitation, setGlobalRecitation] = useState<"hafs" | "warsh" | "sosi">("hafs");

  // 2. Active Search Method Tab ("structure" | "word")
  const [searchMethod, setSearchMethod] = useState<"structure" | "word" | "tajweed">("structure");

  // 3. Active Ayah Metadata for Side Panel & Audio State
  const [activeAyah, setActiveAyah] = useState<ActiveAyahMeta | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Universal Handler fired when ANY search method selects an Ayah
  const handleAyahSelected = async (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string; tfseer:string }
  ) => {
    setActiveAyah({
      ...ayahMeta,
      startTime,
    });

    if (audioRef.current) {
      // Use the safe async audio player helper
      await playAudioSegment(audioRef.current, audioSrc, startTime);
      setIsPlaying(true);
    }
  };

  // Toggle Play / Pause button
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Global Tafseer Cache
  const [tafseerMap, setTafseerMap] = useState<TafseerMap>({});
  const [loadingTafseer, setLoadingTafseer] = useState<boolean>(true);

  // Pre-load global CSV Tafseer on mount
  useEffect(() => {
    async function loadGlobalTafseer() {
      try {
        const res = await fetch("/tfseer.csv");
        const csvText = await res.text();
        const parsedMap = parseTafseerCsv(csvText);
        setTafseerMap(parsedMap);
      } catch (err) {
        console.error("خطأ أثناء تحميل ملف التفسير الشامل:", err);
      } finally {
        setLoadingTafseer(false);
      }
    }

    loadGlobalTafseer();
  }, []);

  // Instant O(1) Lookup for Active Ayah
  const currentTafseerText = activeAyah
    ? tafseerMap[`${activeAyah.surah}:${activeAyah.ayah}`] || "لا يتوفر تفسير لهذه الآية في الملف الحالي."
    : null;

  return (
    <main dir="rtl" className="min-h-screen font-sans bg-background text-foreground antialiased p-spacing md:p-8 tracking-normal">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Global Recitation Selector */}
        <header className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">الظواهر الصوتية</h1>
            {/* <p className="text-muted-foreground text-sm">استمع للتلاوات الصوتية النقية وقارن نطق الكلمات وأحكام التجويد عبر الملفات الصوتية المباشرة.</p> */}
            <p className="text-muted-foreground text-sm"> استعرض الأمثلة القرائية لظواهر صوتية، واستمع إليها لتتمكن من أدائها أداء صحيحا</p>
          </div>

          <div className="bg-card border border-border p-3 rounded-radius shadow-sm flex items-center space-x-reverse space-x-3">
            <span className="text-xs font-medium text-muted-foreground font-serif">الرواية الحالية:</span>
            <select
              value={globalRecitation}
              onChange={(e) => {
                setGlobalRecitation(e.target.value as "hafs" | "warsh" | "sosi");
                setActiveAyah(null); // Reset current playhead on recitation switch
              }}
              className="p-1.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium font-serif"
            >
              <option value="hafs">حفص عن عاصم</option>
              <option value="warsh">ورش عن نافع</option>
              <option value="sosi">السوسي عن أبي عمرو</option>
            </select>
          </div>
        </header>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Search Tools & Audio Player */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Method Navigation Tabs */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-6">
              <div className="flex space-x-4 space-x-reverse border-b border-border pb-2">
                <button
                  onClick={() => setSearchMethod("structure")}
                  className={`pb-2 px-1 font-medium text-sm transition-colors ${
                    searchMethod === "structure"
                      ? "border-b-2 border-primary text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  البحث بالسورة والآية
                </button>
                <button
                  onClick={() => setSearchMethod("word")}
                  className={`pb-2 px-1 font-medium text-sm transition-colors ${
                    searchMethod === "word"
                      ? "border-b-2 border-primary text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  البحث بالكلمة والتشكيل
                </button>
                <button
                  onClick={
                    () => {
                      setSearchMethod("tajweed")
                      setGlobalRecitation("sosi"); // Set your default recitation here
                    }
                  }
                  className={`pb-2 px-1 font-medium text-sm transition-colors ${
                    searchMethod === "tajweed" ? "border-b-2 border-primary text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                   الظواهر الصوتية
                </button>
              </div>

              {/* Method 1 Component */}
              {searchMethod === "structure" && (
                <SurahAyahSearch
                  selectedRecitation={globalRecitation}
                  onAyahSelected={handleAyahSelected}
                />
              )}

              {/* Method 2 Component */}
              {searchMethod === "word" && (
                <WordSearch
                  selectedRecitation={globalRecitation}
                  onAyahSelected={handleAyahSelected}
                />
              )}
              {/* Render Method 3 */}
              {searchMethod === "tajweed" && (
                <TajweedSearch
                  selectedRecitation={globalRecitation}
                  onAyahSelected={handleAyahSelected}
                />
              )}
            </div>

            {/* Direct HTML5 Audio Player Card */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4">
              <audio
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full"
                controls
              />

              {activeAyah ? (
                <div className="flex items-center justify-between bg-muted/40 p-4 rounded-radius border border-border">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary block">
                      التلاوة النشطة: سورة [{activeAyah.surah}] - الآية [{activeAyah.ayah}]
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      التوقيت المستهدف: {activeAyah.startTime.toFixed(2)} ثانية
                    </span>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-radius font-medium text-sm shadow hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? "إيقاف مؤقت ⏸" : "تشغيل الآن ◀"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  اختر آية من القوائم أعلاه لبدء القفز التلقائي والتسمع عبر المشغل الصوتي.
                </p>
              )}
            </div>

          </div>

          {/* Column 3: Context Panel */}
          <div className="space-y-6">
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold border-b border-border pb-2 text-primary font-serif">
                  اللوحة التفسيرية والتعليمية
                </h2>

                {activeAyah ? (
                  <div className="space-y-6 mt-4">
                    {/* Selected Verse Text */}
                    <div>
                      <span className="inline-block text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius font-semibold mb-2">
                        سورة {activeAyah.surah} : الآية {activeAyah.ayah}
                      </span>
                      <p className="text-xl font-mono text-right border-r-4 border-accent pr-3 py-2 bg-muted/30 rounded-l-radius leading-relaxed">
                        {normalizeQuranicMarks(activeAyah.text)}
                      </p>
                    </div>

                    {/* Dynamic Tafseer Display */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                        التفسير والبيان (التفسير الميسر)
                      </h3>
                      {loadingTafseer ? (
                        <p className="text-xs text-muted-foreground">جاري تحميل التفسير...</p>
                      ) : (
                        <p className="text-sm font-serif leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                          {currentTafseerText}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 text-sm">
                    قم باختيار آية من أساليب البحث لعرض النص المباشر والتفسير هنا.
                  </div>
                )}
              </div>
            </div>
          </div>
        

        </div>
      </div>
    </main>
  );
}