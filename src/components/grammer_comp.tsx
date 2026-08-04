"use client";

import React, { useState, useEffect, useRef } from "react";
import GrammarLinguisticSearch from "@/components/GrammarLinguisticSearch";
import { parseTafseerCsv, TafseerMap } from "@/components/tafseerParser";
import { playAudioSegment } from "@/components/audioHandler";

interface ActiveAyahState {
  surah: number;
  ayah: number;
  text: string;
  startTime: number;
}

export default function GrammarSearchPage() {
  // Currently active Ayah for media playback & Tafseer display
  const [activeAyah, setActiveAyah] = useState<ActiveAyahState | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Global Tafseer Cache
  const [tafseerMap, setTafseerMap] = useState<TafseerMap>({});
  const [loadingTafseer, setLoadingTafseer] = useState<boolean>(true);

  // HTML5 Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Pre-load global Tafseer CSV on app mount
  useEffect(() => {
    async function loadGlobalTafseer() {
      try {
        const res = await fetch("/tafseer/moyassar_full.csv");
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

  // 2. Universal Callback triggered when a grammar example is clicked
  const handleAyahSelected = async (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string }
  ) => {
    setActiveAyah({
      ...ayahMeta,
      startTime,
    });

    if (audioRef.current) {
      await playAudioSegment(audioRef.current, audioSrc, startTime);
      setIsPlaying(true);
    }
  };

  // Toggle Audio Play / Pause
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

  // Instant O(1) Tafseer Lookup for current Ayah
  const currentTafseerText = activeAyah
    ? tafseerMap[`${activeAyah.surah}:${activeAyah.ayah}`] ||
      "لا يتوفر تفسير لهذه الآية في الملف الحالي."
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8" dir="rtl">
      {/* Hidden Master Audio Player */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      {/* Header Banner */}
      <header className="mb-8 border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-serif text-primary">
            منصة البحث في التراكيب اللغوية والنحوية
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            منظومة التحليل النحوي والتراكيب القرآنية عبر التصفية المتعددة المستويات
          </p>
        </div>

        {/* Global Status Badge */}
        <div className="bg-card border border-border px-4 py-2 rounded-radius shadow-sm text-xs font-mono text-muted-foreground">
          الرواية المعتمدة: <span className="text-primary font-bold">حفص عن عاصم</span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Search Panel (Tool 4: Grammar 4-Level Search) */}
        <div className="lg:col-span-7 space-y-6">
          <GrammarLinguisticSearch onAyahSelected={handleAyahSelected} />
        </div>

        {/* Sidebar: Media Control & Tafseer Educational Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Media Player Control Box */}
          <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-4">
            <h2 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
              القارئ والتحكم الصوتي
            </h2>

            {activeAyah ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-radius border border-border">
                  <div className="text-xs font-mono">
                    <span className="text-muted-foreground">موضع الشاهد: </span>
                    <span className="text-primary font-bold">
                      سورة [{activeAyah.surah}] - الآية [{activeAyah.ayah}]
                    </span>
                  </div>
                  <button
                    onClick={togglePlayPause}
                    className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-radius hover:bg-primary/90 transition-all shadow-sm"
                  >
                    {isPlaying ? "إيقاف مؤقت ⏸" : "تشغيل التلاوة ◀"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                اختر تركيباً وشاهداً قرآنياً للبدء في التشغيل التلقائي.
              </p>
            )}
          </div>

          {/* Educational Tafseer Panel */}
          <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md min-h-[300px]">
            <h2 className="text-base font-bold font-serif text-primary border-b border-border pb-2">
              اللوحة التفسيرية والتعليمية
            </h2>

            {activeAyah ? (
              <div className="space-y-5 mt-4">
                {/* Active Verse Snippet */}
                <div>
                  <span className="inline-block text-[11px] font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius font-semibold mb-2">
                    النص القرآني المباشر
                  </span>
                  <p className="text-xl font-quran text-right border-r-4 border-accent pr-3 py-2 bg-muted/30 rounded-l-radius leading-relaxed">
                    {activeAyah.text}
                  </p>
                </div>

                {/* Dynamic Tafseer Display */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    التفسير والبيان (التفسير الميسر)
                  </h3>
                  {loadingTafseer ? (
                    <p className="text-xs text-muted-foreground">جاري تحميل البيانات التفسيرية...</p>
                  ) : (
                    <p className="text-sm font-serif leading-relaxed text-foreground/90 bg-popover p-3.5 rounded-radius border border-border">
                      {currentTafseerText}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-16 text-xs">
                انقر على أي مثال أو شاهد قرآني لعرض النص المباشر الشامل والتفسير هنا.
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}