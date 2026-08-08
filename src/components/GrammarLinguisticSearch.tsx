"use client";

import React, { useState, useEffect } from "react";
import { parseSrt, AyahCue } from "@/components/srtParser";
import {
  GRAMMAR_TAXONOMY,
  GRAMMAR_MOCK_DATA,
  GrammarRuleRecord,
  GrammarExample,
  parseGrammarCsv,
} from "@/components/grammarMockData";

interface GrammarLinguisticSearchProps {
  onAyahSelected: (
    audioSrc: string,
    startTime: number,
    ayahMeta: { surah: number; ayah: number; text: string, ayahStr: string, ref:string }
  ) => void;
}

export default function GrammarLinguisticSearch({
  onAyahSelected,
}: GrammarLinguisticSearchProps) {

  // Add state for dynamic CSV Grammar records
    const [grammarRecords, setGrammarRecords] = useState<GrammarRuleRecord[]>([]);

    // Pre-load CSV dataset for Grammar inside useEffect
    useEffect(() => {
    async function loadGrammarCsvData() {
        try {
        const res = await fetch("/grammar_full.csv");
        const csvText = await res.text();
        const parsedRecords = parseGrammarCsv(csvText);
        setGrammarRecords(parsedRecords);
        } catch (err) {
        console.error("خطأ أثناء تحميل ملف CSV الخاص بالهمزات:", err);
        }
    }

    loadGrammarCsvData();
    }, []);

  // 1. Cascading Selection Levels State
  const [lvl1, setLvl1] = useState<string>(""); // الباب
  const [lvl2, setLvl2] = useState<string>(""); // المجال
  const [lvl3, setLvl3] = useState<string>(""); // المقدم
  const [lvl4, setLvl4] = useState<string>(""); // المؤخر

  

  // 2. Subtitle Cue Cache State
  const [srtDataStore, setSrtDataStore] = useState<Record<number, AyahCue[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Pre-load SRT files for timing on component mount
  useEffect(() => {
    async function loadSrtResources() {
      setLoading(true);
      const surahIds = [1, 2];
      const loadedStore: Record<number, AyahCue[]> = {};

      await Promise.all(
        surahIds.map(async (sId) => {
          try {
            const res = await fetch(`/subtitles/hafs_surah${sId}.srt`);
            const text = await res.text();
            loadedStore[sId] = parseSrt(text);
          } catch (e) {
            console.error(`Error pre-loading SRT for Surah ${sId}:`, e);
          }
        })
      );

      setSrtDataStore(loadedStore);
      setLoading(false);
    }

    loadSrtResources();
  }, []);

  // Level 2 Options based on Level 1
  const lvl2Options = lvl1 ? Object.keys(GRAMMAR_TAXONOMY[lvl1] || {}) : [];

  // Level 3 Options based on Level 2
  const lvl3Options = lvl1 && lvl2 ? Object.keys(GRAMMAR_TAXONOMY[lvl1]?.[lvl2] || {}) : [];

  // Level 4 Options based on Level 3
  const lvl4Options = lvl1 && lvl2 && lvl3 ? GRAMMAR_TAXONOMY[lvl1]?.[lvl2]?.[lvl3] || [] : [];

  // Reset deeper choices when parent level changes
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

  // Filter matching rules against active 4-level taxonomy selections
//   const activeGrammarRules = GRAMMAR_MOCK_DATA.filter((rule) => {
//     if (!lvl1) return false;
//     if (lvl1 && rule.bab !== lvl1) return false;
//     if (lvl2 && rule.majal !== lvl2) return false;
//     if (lvl3 && rule.muqaddam !== lvl3) return false;
//     if (lvl4 && rule.muakhar !== lvl4) return false;
//     return true;
//   });
// Update active filtering to evaluate against grammarRecords
  const activeGrammarRules = grammarRecords.filter((rule) => {
    if (!lvl1) return false;
    // const [p1, p2, p3, p4] = rule.bab;
    if (lvl1 &&  rule.bab !== lvl1) return false;
    if (lvl2 &&  rule.majal !== lvl2) return false;
    if (lvl3 &&  rule.muqaddam !== lvl3) return false;
    if (lvl4 &&  rule.muakhar !== lvl4) return false;
    return true;
  });

  // Trigger audio jump and metadata pass to parent player & sidebar
  const handleExampleClick = (example: GrammarExample) => {
    const surahNum = Number(example.surah) || 1;
    const ayahNum = Number(example.ayahNumber);
    const audioPath = `/audio/hafs_surah${surahNum}.mp3`;

    const cues = srtDataStore[surahNum] || [];
    const cue = cues.find((c) => Number(c.ayahNumber) === ayahNum);
    const startTime = cue ? cue.start : 0;

    onAyahSelected(audioPath, startTime, {
      surah: surahNum,
      ayah: ayahNum,
      text: example.text,
      ayahStr: example.ayah,
      ref: example.ayah
    });
  };

  // Render text with word highlight badges
  const renderHighlightedGrammarText = (text: string, highlightedIndexes: number[]) => {
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

  return (
    <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md space-y-6" dir="rtl">
      
      {/* Title Header */}
      <div className="border-b border-border pb-3">
        <h3 className="text-lg font-bold font-serif text-primary">
          محرك البحث في التراكيب اللغوية والنحوية
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          استكشف التراكيب والأنماط النحوية عبر تصفية المستويات الأربعة المتعاقبة.
        </p>
      </div>

      {/* 4-Level Cascading Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-radius border border-border">
        
        {/* Level 1: الباب */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            المستوى الأول: الباب النحوي
          </label>
          <select
            value={lvl1}
            onChange={(e) => handleLvl1Change(e.target.value)}
            className="w-full p-2.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          >
            <option value="">-- اختر الباب --</option>
            {Object.keys(GRAMMAR_TAXONOMY).map((bab) => (
              <option key={bab} value={bab}>
                {bab}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2: المجال */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            المستوى الثاني: المجال التركيبي
          </label>
          <select
            value={lvl2}
            disabled={!lvl1 || lvl2Options.length === 0}
            onChange={(e) => handleLvl2Change(e.target.value)}
            className="w-full p-2.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          >
            <option value="">-- اختر المجال --</option>
            {lvl2Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3: المقدم */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            المستوى الثالث: العنصر المقدَّم
          </label>
          <select
            value={lvl3}
            disabled={!lvl2 || lvl3Options.length === 0}
            onChange={(e) => handleLvl3Change(e.target.value)}
            className="w-full p-2.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          >
            <option value="">-- اختر العنصر المقدم --</option>
            {lvl3Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Level 4: المؤخر */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            المستوى الرابع: العنصر المؤخَّر
          </label>
          <select
            value={lvl4}
            disabled={!lvl3 || lvl4Options.length === 0}
            onChange={(e) => setLvl4(e.target.value)}
            className="w-full p-2.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring font-serif"
          >
            <option value="">-- اختر العنصر المؤخر --</option>
            {lvl4Options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Results Display Area */}
      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-4">جاري تحميل قواعد البيانات والنصوص...</p>
      ) : !lvl1 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          يرجى تحديد الباب والمستويات التركيبية من المجموعات المنسدلة أعلاه لعرض الأنماط والآيات.
        </p>
      ) : activeGrammarRules.length > 0 ? (
        <div className="space-y-4">
          {activeGrammarRules.map((rule) => (
            <div
              key={rule.id}
              className="p-4 text-right rounded-radius border bg-popover text-popover-foreground border-border space-y-3"
            >
              {/* Header Badges */}
              <div className="flex justify-between items-center text-xs font-bold text-primary border-b border-border pb-2">
                <span>{rule.title}</span>
                <span className="text-muted-foreground font-sans text-[11px] bg-muted px-2 py-0.5 rounded-radius">
                  {rule.bab}
                </span>
              </div>

              {/* Rule Explanation */}
              {/* <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-radius border border-border">
                <strong className="text-primary">القاعدة النحوية:</strong> {rule.grammaticalRule}
              </p> */}

              {/* Quranic Example Chips */}
              <div className="space-y-2">
                {/* <span className="text-xs font-bold text-muted-foreground block">
                  الشواهد القرآ نية (انقر للتسمع ولتحديث اللوحة التفسيرية):
                </span> */}
                <div className="flex flex-wrap gap-2">
                  {rule.quranicExamples.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleExampleClick({...ex,ref:rule.grammaticalRule})}
                      className="bg-card hover:bg-accent/30 border border-border hover:border-accent p-2.5 rounded-radius flex flex-col items-start space-x-reverse space-x-2 transition-all shadow-sm hover:shadow"
                    >
                      <span className="text-xs font-mono font-bold text-primary">
                        {ex.surahName}:{ex.ayahNumber}
                      </span>
                      <span className="text-base font-mono text-foreground">
                        {renderHighlightedGrammarText(ex.ayah, ex.highlighted || [])}
                      </span>
                      {/* <span className="text-xs text-primary">▶</span> */}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-muted/20 border border-dashed border-border rounded-radius space-y-1">
          <p className="text-sm font-medium text-foreground">تركيب غير مسجل في العرض</p>
          <p className="text-xs text-muted-foreground">
            هذا المسار التركيبي لا يحتوي على شواهد مسجلة في هذه النسخة التجريبية.
          </p>
        </div>
      )}

    </div>
  );
}