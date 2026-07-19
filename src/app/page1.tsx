"use client";

import React, { useState, useEffect, useRef } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";

// --- Mock Data Types ---
interface WordOccurrence {
  surah: number;
  ayah: number;
}

interface WordIndex {
  word_id: string;
  text_clean: string;
  text_tashkeel: string;
  occurrences: WordOccurrence[];
}

interface VerseData {
  surah_number: number;
  ayah_number: number;
  text_arabic: string;
  tafseer: string;
  recitation_guide: string;
  start_time_seconds: number;
}

// --- Static Mock Data (Normally imported from your src/data folder) ---
const MOCK_WORDS_INDEX: WordIndex[] = [
  {
    word_id: "w1",
    text_clean: "قالوا",
    text_tashkeel: "قَالُوا۟",
    occurrences: [{ surah: 2, ayah: 30 }, { surah: 3, ayah: 15 }]
  },
  {
    word_id: "w2",
    text_clean: "قالوا",
    text_tashkeel: "قَالُواْ",
    occurrences: [{ surah: 5, ayah: 112 }]
  }
];

const MOCK_VERSES: Record<string, VerseData> = {
  "2:30": {
    surah_number: 2,
    ayah_number: 30,
    text_arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
    tafseer: "Remember when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority'...",
    recitation_guide: "Pay close attention to the elongation (Madd) on 'لِلْمَلَائِكَةِ' and the nasalization (Ghunnah) on 'إِنِّي'.",
    start_time_seconds: 1245 // Timestamp inside the master video
  },
  "3:15": {
    surah_number: 3,
    ayah_number: 15,
    text_arabic: "قُلْ أَؤُنَبِّئُكُمْ بِخَيْرٍ مِنْ ذَٰلِكُمْ",
    tafseer: "Say, 'Shall I inform you of something better than that?'...",
    recitation_guide: "Observe the clear pronunciation of the Hamza and the Ikhfa on 'مِنْ ذَٰلِكُمْ'.",
    start_time_seconds: 2450
  }
};

const MASTER_YOUTUBE_VIDEO_ID = "wkXufgycbd4"; // Replace with your actual single full Quran YouTube Video ID

export default function QuranSearchPage() {
  // Input Selection States
  const [searchMethod, setSearchMethod] = useState<"structure" | "word">("structure");
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [selectedAyahNum, setSelectedAyahNum] = useState<string>("");
  
  // Word Search States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchedWords, setMatchedWords] = useState<WordIndex[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);
  
  // Active Selected Verse and Player States
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  // Helper to strip Tashkeel for simple search matching
  const stripTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670]/g, "");
  };

  // Handle word input matching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setMatchedWords([]);
      return;
    }
    const cleanQuery = stripTashkeel(searchQuery);
    const matches = MOCK_WORDS_INDEX.filter((w) =>
      stripTashkeel(w.text_clean).includes(cleanQuery)
    );
    setMatchedWords(matches);
  }, [searchQuery]);

  // Handle manual structure navigation selection trigger
  useEffect(() => {
    if (searchMethod === "structure" && selectedSurah && selectedAyahNum) {
      const key = `${selectedSurah}:${selectedAyahNum}`;
      if (MOCK_VERSES[key]) {
        setActiveVerseKey(key);
      }
    }
  }, [selectedSurah, selectedAyahNum, searchMethod]);

  // Handle time skipping when player is ready and active verse updates
  useEffect(() => {
    if (player && activeVerseKey && MOCK_VERSES[activeVerseKey]) {
      const startTime = MOCK_VERSES[activeVerseKey].start_time_seconds;
      player.seekTo(startTime, true);
      player.playVideo();
    }
  }, [activeVerseKey, player]);

  const activeVerse = activeVerseKey ? MOCK_VERSES[activeVerseKey] : null;

  return (
    <main className="min-h-screen font-sans bg-background text-foreground antialiased p-spacing md:p-8 tracking-normal">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="border-b border-border pb-4">
          <h1 className="text-3xl font-serif font-bold text-primary">Quranic Recitation Search Engine</h1>
          <p className="text-muted-foreground text-sm">Learn precise articulation and Tajweed by matching verses directly to recitations.</p>
        </header>

        {/* Dashboard Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Search Controls and Media Player */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Selection Block */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md">
              <div className="flex space-x-4 mb-6 border-b border-border pb-2">
                <button
                  onClick={() => { setSearchMethod("structure"); setSelectedWord(null); }}
                  className={`pb-2 px-1 font-medium text-sm transition-colors ${searchMethod === "structure" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  By Chapter & Verse
                </button>
                <button
                  onClick={() => setSearchMethod("word")}
                  className={`pb-2 px-1 font-medium text-sm transition-colors ${searchMethod === "word" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  By Word Search
                </button>
              </div>

              {/* Mode A: Surah / Ayah Dropdowns */}
              {searchMethod === "structure" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Surah (Chapter)</label>
                    <select
                      value={selectedSurah}
                      onChange={(e) => { setSelectedSurah(e.target.value); setSelectedAyahNum(""); }}
                      className="w-full p-2 rounded-radius border border-input bg-popover text-popover-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Surah</option>
                      <option value="2">Al-Baqarah (2)</option>
                      <option value="3">Ali 'Imran (3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Ayah (Verse)</label>
                    <select
                      value={selectedAyahNum}
                      onChange={(e) => setSelectedAyahNum(e.target.value)}
                      disabled={!selectedSurah}
                      className="w-full p-2 rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select Ayah</option>
                      {selectedSurah === "2" && <option value="30">Ayah 30</option>}
                      {selectedSurah === "3" && <option value="15">Ayah 15</option>}
                    </select>
                  </div>
                </div>
              )}

              {/* Mode B: Word Lookup with Tashkeel Matcher */}
              {searchMethod === "word" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Enter Arabic Word</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="e.g. قالوا"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-3 font-serif rounded-radius border border-input bg-popover text-popover-foreground text-right focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Step B1: Dynamic Tashkeel Picker */}
                  {matchedWords.length > 0 && (
                    <div className="p-3 bg-muted rounded-radius border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Select variant with explicit Tashkeel:</p>
                      <div className="flex flex-wrap gap-2" dir="rtl">
                        {matchedWords.map((word) => (
                          <button
                            key={word.word_id}
                            onClick={() => setSelectedWord(word)}
                            className={`px-3 py-1.5 rounded-radius text-lg font-serif border transition-all ${selectedWord?.word_id === word.word_id ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-input hover:bg-accent/50"}`}
                          >
                            {word.text_tashkeel}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step B2: Display Verses containing chosen token */}
                  {selectedWord && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Select an Ayah to view and play:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                        {selectedWord.occurrences.map((occ) => {
                          const key = `${occ.surah}:${occ.ayah}`;
                          const verse = MOCK_VERSES[key];
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveVerseKey(key)}
                              className={`w-full p-3 text-right rounded-radius border flex flex-col justify-between items-end transition-colors ${activeVerseKey === key ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-border hover:bg-accent/20"}`}
                            >
                              <span className="text-xs font-mono font-semibold text-primary">Surah {occ.surah}, Ayah {occ.ayah}</span>
                              <span className="text-base font-serif mt-1" dir="rtl">{verse?.text_arabic || "Loading textual content..."}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            

            {/* Video Container Module */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md flex flex-col items-center justify-center min-h-[360px]">
              {activeVerseKey ? (
                <div className="w-full aspect-video rounded-radius overflow-hidden shadow-lg border border-border bg-black">
                  <YouTube
                    videoId={MASTER_YOUTUBE_VIDEO_ID}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        origin: typeof window !== "undefined" ? window.location.origin : "",
                      },
                    }}
                    onReady={(e) => setPlayer(e.target)}
                    iframeClassName="w-full h-full aspect-video" // Fixes the internal iframe dimensions directly
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground space-y-2">
                  <div className="text-4xl text-accent">🎦</div>
                  <p className="text-sm font-medium">Player Standby</p>
                  <p className="text-xs max-w-sm mx-auto">Please filter and select an Ayah using the controls above to sync the master media track.</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Information & Metadata Side Panel */}
          <div className="space-y-6">
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md h-full space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold border-b border-border pb-2 text-primary">Contextual Panel</h2>
                
                {activeVerse ? (
                  <div className="space-y-6 mt-4">
                    {/* Verse Metadata Display */}
                    <div>
                      <span className="inline-block text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius font-semibold mb-2">
                        Verse Context — {activeVerse.surah_number}:{activeVerse.ayah_number}
                      </span>
                      <p className="text-xl font-serif text-right border-r-4 border-accent pr-3 py-1 bg-muted/40 rounded-l-radius" dir="rtl">
                        {activeVerse.text_arabic}
                      </p>
                    </div>

                    {/* Tafseer Segment */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Tafseer (Exegesis)</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.tafseer}
                      </p>
                    </div>

                    {/* Tajweed Articulation Guide */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Recitation & Sight Guide</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.recitation_guide}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 text-sm">
                    No active Ayah selected. Choose an entry to load Tafseer and phonetic guidelines.
                  </div>
                )}
              </div>

              {/* Utility Branding Footnote */}
              <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center">
                <span>Status: Fully Configured</span>
                <span>Master Track Sync: Active</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}