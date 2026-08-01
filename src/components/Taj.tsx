"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import { parseEdghamCsv, EdghamRecord } from "@/components/csvParser";
import { HAMZA_MOCK_DATA, HAMZA_TAXONOMY, HamzaExample } from "@/components/hamzaMockData";

interface TajweedSearchProps {
  selectedRecitation: "hafs" | "warsh" | "sosi";
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string; tfseer: string }
  ) => void;
}

const AVAILABLE_SURAHS = [
  { id: "all", name: "القرآن كاملاً" },
  { id: "1", name: "سورة الفاتحة (1)" },
  { id: "2", name: "سورة لقمان (2)" },
];

export default function TajweedSearch({
  selectedRecitation,
  onAyahSelected,
}: TajweedSearchProps) {


// 1. Cascading selection levels
const [lvl1, setLvl1] = useState<string>("");
const [lvl2, setLvl2] = useState<string>("");
const [lvl3, setLvl3] = useState<string>("");
const [lvl4, setLvl4] = useState<string>("");

// Options for Level 2 based on Level 1
const lvl2Options = lvl1 ? Object.keys(HAMZA_TAXONOMY[lvl1] || {}) : [];

// Options for Level 3 based on Level 2
const lvl3Options = lvl1 && lvl2 ? Object.keys(HAMZA_TAXONOMY[lvl1]?.[lvl2] || {}) : [];

// Options for Level 4 based on Level 3
const lvl4Options = lvl1 && lvl2 && lvl3 ? HAMZA_TAXONOMY[lvl1]?.[lvl2]?.[lvl3] || [] : [];

// Reset deeper levels on parent change
const handleLvl1Change = (val: string) => {
  setLvl1(val);
  setLvl2("");
  setLvl3("");
  setLvl4("");
};

const handleLvl2Change = (val: string) => {
  setLvl2(val);
  setLvl3("");
  setLvl4("");
};

const handleLvl3Change = (val: string) => {
  setLvl3(val);
  setLvl4("");
};

// Filter matching rules against active 4-level path
const activeHamzaRules = HAMZA_MOCK_DATA.filter((rule) => {
  if (!lvl1) return false;
  const [p1, p2, p3, p4] = rule.categoryPath;
  if (lvl1 && p1 !== lvl1) return false;
  if (lvl2 && p2 !== lvl2) return false;
  if (lvl3 && p3 !== lvl3) return false;
  if (lvl4 && p4 !== lvl4) return false;
  return true;
});

  // 1. Navigation category (Edgham vs. Hamza)
  const [tajweedCategory, setTajweedCategory] = useState<"edgham" | "hamza">("edgham");

  // 2. Edgham Subtype Filter ("all" | "mutamathilan" | "mutajanisan")
  const [edghamSubtype, setEdghamSubtype] = useState<"all" | "mutamathilan" | "mutajanisan">("mutamathilan");

  // 3. Global Datasets & Caches
  const [selectedSurahScope, setSelectedSurahScope] = useState<string>("all");
  const [globalEdghamRecords, setGlobalEdghamRecords] = useState<EdghamRecord[]>([]);
  const [srtDataStore, setSrtDataStore] = useState<Record<number, AyahCue[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);

  // Pre-load global Edgham CSV and SRT timing files
  useEffect(() => {
    async function loadAllTajweedResources() {
      setLoading(true);
      setSelectedPair(null);

      try {
        // Fetch CSV dataset
        const csvPath = `/edgham_${selectedRecitation}.csv`;
        const csvRes = await fetch(csvPath);
        const csvText = await csvRes.text();
        setGlobalEdghamRecords(parseEdghamCsv(csvText));

        // Pre-fetch SRT files for Surahs 1 and 2
        const surahIds = [1, 2];
        const loadedSrtStore: Record<number, AyahCue[]> = {};

        await Promise.all(
          surahIds.map(async (sId) => {
            try {
              const srtRes = await fetch(`/${sId===1?"001":"031"}_${selectedRecitation}.srt`);
              const srtText = await srtRes.text();
              loadedSrtStore[sId] = parseSrt(srtText);
            } catch (e) {
              console.error(`Could not pre-load SRT for Surah ${sId}:`, e);
            }
          })
        );

        setSrtDataStore(loadedSrtStore);
      } catch (err) {
        console.error("خطأ أثناء تحميل بيانات التجويد:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllTajweedResources();
  }, [selectedRecitation]);

  // Filter Edgham records by Scope and Subtype (All / Mutamathilan / Mutajanisan)
  const activeScopeRecords = globalEdghamRecords.filter((r) => {
    const matchesSurah =
      selectedSurahScope === "all" || Number(r.surahNumber) === Number(selectedSurahScope);
    
    let matchesType = true;
    if (edghamSubtype === "mutamathilan") {
      matchesType = r.type === "متماثلان";
    } else if (edghamSubtype === "mutajanisan") {
      matchesType = r.type === "متجانسان";
    }

    return matchesSurah && matchesType;
  });

  const availablePairs = Array.from(new Set(activeScopeRecords.map((r) => r.letterPair)));
  const activeMatches = selectedPair ? activeScopeRecords.filter((r) => r.letterPair === selectedPair) : [];

  // Handle clicking an Edgham record to play MP3
  const handleEdghamRecordClick = (record: EdghamRecord) => {
    const surahNum = Number(record.surahNumber);
    const startAyahNum = Number(record.startAyahNumber);
    const audioPath = `/audio/${surahNum===1?"001":"031"}_${selectedRecitation}.mp3`;
    const surahCues = srtDataStore[surahNum] || [];
    const cue = surahCues.find((c) => Number(c.ayahNumber) === startAyahNum);

    if (!cue) return;

    onAyahSelected(audioPath, cue.start, {
      surah: surahNum,
      ayah: startAyahNum,
      text: cue.text || record.snippetText,
      tfseer:  cue.text || record.snippetText,
    });
  };

  // Handle clicking a Hamza Example Chip to play MP3
  const handleHamzaExampleClick = (example: HamzaExample) => {
    const surahNumMap: Record<string, number> = {
      "الفاتحة": 1,
      "البقرة": 2,
      "النمل": 27,
      "النور": 24,
    };

    const surahNum = surahNumMap[example.surahName] || 2;
    const ayahNum = Number(example.ayahNumber);
    const audioPath = `/audio/${surahNum}_${ayahNum}.wav`;// ${selectedRecitation}
    const surahCues = srtDataStore[surahNum] || [];
    const cue = surahCues.find((c) => Number(c.ayahNumber) === ayahNum);

    const startTime = cue ? cue.start : 0;

    onAyahSelected(audioPath, startTime, {
      surah: surahNum,
      ayah: ayahNum,
      text: example.text,
      tfseer: example.text
    });
  };

  /**
 * Helper to render Hamza example text with highlighted words
 */
const renderHighlightedHamzaText = (text: string, highlightedIndexes: number[]) => {
    const words = text.split(/\s+/);
  
    return (
      <span className="font-quran leading-loose">
        {words.map((word, wIdx) => {
          const isHighlighted = highlightedIndexes.includes(wIdx);
          return (
            <React.Fragment key={wIdx}>
              <span
                className={
                  isHighlighted
                    ? "bg-amber-300 text-amber-950 font-bold px-1.5 py-0.5 rounded-md border border-amber-400 shadow-sm"
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

  /**
   * Helper to render full Ayah text from SRT with highlighted Edgham pair words
   */
  const renderHighlightedAyahText = (record: EdghamRecord) => {
    const surahNum = Number(record.surahNumber);
    const startAyahNum = Number(record.startAyahNumber);
    const currentCues = srtDataStore[surahNum] || [];

    // Single Ayah occurrence
    if (!record.secondAyahNumber) {
      const cue = currentCues.find((c) => Number(c.ayahNumber) === startAyahNum);
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
                      ? "bg-amber-300 text-amber-950 font-bold px-1.5 py-0.5 rounded-md border border-amber-400 shadow-sm"
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
    const secondAyahNum = Number(record.secondAyahNumber);
    const cue1 = currentCues.find((c) => Number(c.ayahNumber) === startAyahNum);
    const cue2 = currentCues.find((c) => Number(c.ayahNumber) === secondAyahNum);

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
                    ? "bg-amber-300 text-amber-950 font-bold px-1.5 py-0.5 rounded-md border border-amber-400 shadow-sm"
                    : ""
                }
              >
                {word}
              </span>{" "}
            </React.Fragment>
          );
        })}
        <span className="text-xs font-mono text-primary font-bold px-1">
          ([{startAyahNum}])
        </span>{" "}
        {/* Ayah 2 */}
        {words2.map((word, wIdx) => {
          const isHighlighted = wIdx === 0;
          return (
            <React.Fragment key={`a2_${wIdx}`}>
              <span
                className={
                  isHighlighted
                    ? "bg-amber-300 text-amber-950 font-bold px-1.5 py-0.5 rounded-md border border-amber-400 shadow-sm"
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
    <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-6" dir="rtl">
      
      {/* Category Selection Tabs */}
      <div className="flex border-b border-border pb-2 space-x-4 space-x-reverse">
        <button
          onClick={() => setTajweedCategory("edgham")}
          className={`pb-2 px-3 text-sm font-bold transition-colors ${
            tajweedCategory === "edgham"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          الإدغام
        </button>
        <button
          onClick={() => setTajweedCategory("hamza")}
          className={`pb-2 px-3 text-sm font-bold transition-colors ${
            tajweedCategory === "hamza"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          الهمزات
        </button>
      </div>

      {/* ======================= Edgham Category ======================= */}
      {tajweedCategory === "edgham" && (
        <div className="space-y-4">
          
          {/* Subtype Filter */}
          <div className="flex items-center space-x-reverse space-x-3 bg-muted/40 p-2 rounded-radius border border-border">
            <span className="text-xs font-medium text-muted-foreground">نوع الإدغام:</span>
            {/* <button
              onClick={() => {
                setEdghamSubtype("all");
                setSelectedPair(null);
              }}
              className={`px-3 py-1 rounded-radius text-xs font-bold transition-all ${
                edghamSubtype === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-popover text-popover-foreground hover:bg-accent/40"
              }`}
            >
              الكل
            </button> */}
            <button
              onClick={() => {
                setEdghamSubtype("mutamathilan");
                setSelectedPair(null);
              }}
              className={`px-3 py-1 rounded-radius text-xs font-bold transition-all ${
                edghamSubtype === "mutamathilan"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-popover text-popover-foreground hover:bg-accent/40"
              }`}
            >
              متماثلان
            </button>
            <button
              onClick={() => {
                setEdghamSubtype("mutajanisan");
                setSelectedPair(null);
              }}
              className={`px-3 py-1 rounded-radius text-xs font-bold transition-all ${
                edghamSubtype === "mutajanisan"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-popover text-popover-foreground hover:bg-accent/40"
              }`}
            >
              متجانسان
            </button>
          </div>

          {/* Surah Scope Selection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">نطاق البحث</label>
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
              اختر الحرفين:
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
              <p className="text-xs text-muted-foreground p-3 border border-dashed rounded-radius text-center">
                لا توجد مواضع إدغام مسجلة في النموذج التجريبي لهذا التصنيف والنطاق المحدد.
              </p>
            )}
          </div>

          {/* Match Results Listing */}
          {selectedPair && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
                <span>مواضع الإدغام للحرفين ({selectedPair}):</span>
                <span className="font-mono text-primary font-bold">عدد المواضع: {activeMatches.length}</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 pl-1">
                {activeMatches.map((record, index) => (
                  <button
                    key={`${record.surahNumber}_${record.startAyahNumber}_${index}`}
                    onClick={() => handleEdghamRecordClick(record)}
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
      )}

      {/* ======================= Hamza Category ======================= */}
      {tajweedCategory === "hamza" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
          اختر التصنيف لاستعراض الأمثلة والاستماع إليه:
          </p>

          {/* Cascading Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-radius border border-border">
            {/* Level 1 Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                المستوى الأول (نوع الهمز)
              </label>
              <select
                value={lvl1}
                onChange={(e) => handleLvl1Change(e.target.value)}
                className="w-full p-2 text-xs rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring font-serif"
              >
                <option value="">-- اختر التصنيف الأول --</option>
                {Object.keys(HAMZA_TAXONOMY).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2 Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                المستوى الثاني (الموقع/السياق)
              </label>
              <select
                value={lvl2}
                disabled={!lvl1 || lvl2Options.length === 0}
                onChange={(e) => handleLvl2Change(e.target.value)}
                className="w-full p-2 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
              >
                <option value="">-- اختر المستوى الثاني --</option>
                {lvl2Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 3 Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                المستوى الثالث (الحركة/النوع)
              </label>
              <select
                value={lvl3}
                disabled={!lvl2 || lvl3Options.length === 0}
                onChange={(e) => handleLvl3Change(e.target.value)}
                className="w-full p-2 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
              >
                <option value="">-- اختر المستوى الثالث --</option>
                {lvl3Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 4 Dropdown */}
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                المستوى الرابع (التفصيل)
              </label>
              <select
                value={lvl4}
                disabled={!lvl3 || lvl4Options.length === 0}
                onChange={(e) => setLvl4(e.target.value)}
                className="w-full p-2 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
              >
                <option value="">-- اختر المستوى الرابع --</option>
                {lvl4Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Area */}
          {!lvl1 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              يرجى تحديد التصنيف من القوائم المنسدلة أعلاه لعرض أحكام الهمز والأمثلة.
            </p>
          ) : activeHamzaRules.length > 0 ? (
            <div className="space-y-3">
              {activeHamzaRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3 text-right rounded-radius border bg-popover text-popover-foreground border-border space-y-2"
                >
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-primary border-b border-border pb-1.5">
                    <span>{rule.title}</span>
                    <span className="text-muted-foreground font-sans">الهمزات: {rule.hamzaCount}</span>
                  </div>

                  {/* Compact Quranic Examples (Triggers Audio & Side-bar info) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rule.quranicExamples.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => handleHamzaExampleClick(ex)}
                        className="bg-card hover:bg-accent/30 border border-border hover:border-accent px-3 py-1.5 rounded-radius flex flex-col items-start space-x-reverse space-x-2 transition-all shadow-sm w-full"
                      >
                        <span className="text-xs font-mono font-bold text-primary">
                          {ex.surahName}:{ex.ayahNumber}
                        </span>
                        <span className="text-base font-mono font-bold text-foreground">
                          {renderHighlightedHamzaText(ex.ayah, ex.highlighted || [])}
                        </span>
                      
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-muted/20 border border-dashed border-border rounded-radius space-y-1">
              <p className="text-sm font-medium text-foreground">بيانات غير مسجلة</p>
              <p className="text-xs text-muted-foreground">
                هذا التصنيف لا يحتوي على أمثلة مسجلة في هذه النسخة التجريبية.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}