"use client";

import React, { useState, useEffect, useRef } from "react";

// --- نماذج البيانات (Data Types) ---
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
  end_time_seconds?: number;
}

interface TajweedRule {
  rule_id: string;
  letters_pair: string;
  description: string;
  occurrences: WordOccurrence[];
}

// --- المسارات المحلية لملفات الـ MP3 لكل رواية ---
const RECITATION_AUDIO_PATHS: Record<string, string> = {
  hafs: "/audio/031_baset.mp3",
  warsh: "/audio/031_maher.mp3",
};

// --- البيانات التجريبية للمشروع ---
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
    occurrences: [{ surah: 2, ayah: 30 }]
  }
];

const MOCK_VERSES_BY_RECITATION: Record<string, Record<string, VerseData>> = {
  hafs: {
    "2:30": {
      surah_number: 2,
      ayah_number: 30,
      text_arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
      tafseer: "تفسير (حفص): واذكر -أيها الرسول- للناس حين قال ربك للملائكة: إني جاعل في الأرض خليفة...",
      recitation_guide: "تنبيه تجويدي (حفص): انتبه للمد المتصل في 'لِلْمَلَائِكَةِ' والغنة في 'إِنِّي'.",
      start_time_seconds: 12.5,
      end_time_seconds: 22.0
    },
    "3:15": {
      surah_number: 3,
      ayah_number: 15,
      text_arabic: "قُلْ أَؤُنَبِّئُكُمْ بِخَيْرٍ مِنْ ذَٰلِكُمْ",
      tafseer: "تفسير (حفص): قل أأخبركم بعاقبة خير من ذلكم المتاع الدنيوي؟",
      recitation_guide: "تنبيه تجويدي (حفص): تحقيق الهمزتين في 'أَؤُنَبِّئُكُمْ' وإخفاء النون في 'مِنْ ذَٰلِكُمْ'.",
      start_time_seconds: 45.0,
      end_time_seconds: 52.5
    }
  },
  warsh: {
    "2:30": {
      surah_number: 2,
      ayah_number: 30,
      text_arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَٰٓئِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
      tafseer: "تفسير (ورش): واذكر حين قال ربك للملائكة إني جاعل في الأرض خليفة (مع قواعد نافع)...",
      recitation_guide: "تنبيه تجويدي (ورش): مد البدل والمشبع 6 حركات، ونقل حركة الهمزة في 'فِي الْأَرْضِ'.",
      start_time_seconds: 14.0,
      end_time_seconds: 24.5
    },
    "3:15": {
      surah_number: 3,
      ayah_number: 15,
      text_arabic: "قُلْ أَؤُنَبِّئُكُم بِخَيْرٍ مِّن ذَٰلِكُمْ",
      tafseer: "تفسير (ورش): قل أأخبركم بخير من ذلكم، مع تسهيل الهمزة الثانية.",
      recitation_guide: "تنبيه تجويدي (ورش): تسهيل الهمزة الثانية في 'أَؤُنَبِّئُكُم' وضمة ميم الجمع.",
      start_time_seconds: 48.0,
      end_time_seconds: 56.0
    }
  }
};

const MOCK_TAJWEED_IDGHAM: TajweedRule[] = [
  {
    rule_id: "n_m",
    letters_pair: "ن - م",
    description: "إدغام بغنة (توالي النون الساكنة أو التنوين مع الميم)",
    occurrences: [{ surah: 3, ayah: 15 }]
  },
  {
    rule_id: "n_y",
    letters_pair: "ن - ي",
    description: "إدغام بغنة (توالي النون الساكنة أو التنوين مع الياء)",
    occurrences: [{ surah: 2, ayah: 30 }]
  }
];

export default function QuranAudioSearchPage() {
  // 1. خيار الرواية العالمي
  const [globalRecitation, setGlobalRecitation] = useState<"hafs" | "warsh">("hafs");

  // 2. طرق الإدخال الثلاثة
  const [searchMethod, setSearchMethod] = useState<"structure" | "word" | "tajweed">("structure");

  // خيارات طريقة (السورة والآية)
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [selectedAyahNum, setSelectedAyahNum] = useState<string>("");

  // خيارات طريقة (البحث بكلمة)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchedWords, setMatchedWords] = useState<WordIndex[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);

  // خيارات طريقة (التجويد - الإدغام)
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<TajweedRule | null>(null);

  // 3. إدارة التشغيل ومسترجع الصوت HTML5 Audio
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // تنظيف التشكيل للمطابقة
  const stripTashkeel = (text: string) => text.replace(/[\u064B-\u065F\u0670]/g, "");

  // معالجة البحث عن الكلمات
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

  // تحديث الآية عند اختيار السورة والآية
  useEffect(() => {
    if (searchMethod === "structure" && selectedSurah && selectedAyahNum) {
      const key = `${selectedSurah}:${selectedAyahNum}`;
      if (MOCK_VERSES_BY_RECITATION[globalRecitation][key]) {
        handleSelectVerse(key);
      }
    }
  }, [selectedSurah, selectedAyahNum, searchMethod, globalRecitation]);

  // دالة اختيار الآية القافزة بالصوت
  const handleSelectVerse = (key: string) => {
    setActiveVerseKey(key);
    const verseData = MOCK_VERSES_BY_RECITATION[globalRecitation][key];

    if (verseData && audioRef.current) {
      audioRef.current.currentTime = verseData.start_time_seconds;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("تنبيه: يتطلب متصفحك تفاعلاً لبدء الصوت تلقائياً", err));
    }
  };

  // التحكم بالتشغيل والإيقاف المباشر
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

  const activeVerse = activeVerseKey && MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey]
    ? MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey]
    : null;

  return (
    <main dir="rtl" className="min-h-screen font-sans bg-background text-foreground antialiased p-spacing md:p-8 tracking-normal">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* رأس الصفحة + اختيار الرواية العالمي */}
        <header className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">التراكيب اللغوية</h1>
            <p className="text-muted-foreground text-sm">استمع للتلاوات الصوتية النقية وقارن نطق الكلمات وأحكام التجويد عبر الملفات الصوتية المباشرة.</p>
          </div>

          {/* خيار الرواية */}
          <div className="bg-card border border-border p-3 rounded-radius shadow-sm flex items-center space-x-reverse space-x-3">
            <span className="text-xs font-medium text-muted-foreground font-serif">الرواية الصوتية:</span>
            <select
              value={globalRecitation}
              onChange={(e) => {
                const newRec = e.target.value as "hafs" | "warsh";
                setGlobalRecitation(newRec);
                if (activeVerseKey && MOCK_VERSES_BY_RECITATION[newRec][activeVerseKey]) {
                  // تحديث موقع التلاوة تلقائياً للرواية الجديدة
                  setTimeout(() => handleSelectVerse(activeVerseKey), 100);
                }
              }}
              className="p-1.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
            >
              <option value="hafs">حفص عن عاصم</option>
              <option value="warsh">ورش عن نافع</option>
            </select>
          </div>
        </header>

        {/* جسم التطبيق الرئيسية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود الأول والثاني: وسائل البحث والتحكم بالصوت */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* كارت طرق الإدخال الثلاثة */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md">
              <div className="flex space-x-4 space-x-reverse mb-6 border-b border-border pb-2 overflow-x-auto">
                <button
                  onClick={() => { setSearchMethod("structure"); setSelectedWord(null); setSelectedTajweedRule(null); }}
                  className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${searchMethod === "structure" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  بالسورة والآية
                </button>
                <button
                  onClick={() => { setSearchMethod("word"); setSelectedTajweedRule(null); }}
                  className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${searchMethod === "word" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  بالبحث عن كلمة
                </button>
                <button
                  onClick={() => { setSearchMethod("tajweed"); setSelectedWord(null); }}
                  className={`pb-2 px-1 font-medium text-sm whitespace-nowrap transition-colors ${searchMethod === "tajweed" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  أحكام التجويد (الإدغام)
                </button>
              </div>

              {/* 1. البحث بالسورة والآية */}
              {searchMethod === "structure" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">السورة</label>
                    <select
                      value={selectedSurah}
                      onChange={(e) => { setSelectedSurah(e.target.value); setSelectedAyahNum(""); }}
                      className="w-full p-2 rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">اختر السورة</option>
                      <option value="2">البقرة (2)</option>
                      <option value="3">آل عمران (3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">الآية</label>
                    <select
                      value={selectedAyahNum}
                      onChange={(e) => setSelectedAyahNum(e.target.value)}
                      disabled={!selectedSurah}
                      className="w-full p-2 rounded-radius border border-input bg-popover text-popover-foreground disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">اختر الآية</option>
                      {selectedSurah === "2" && <option value="30">الآية 30</option>}
                      {selectedSurah === "3" && <option value="15">الآية 15</option>}
                    </select>
                  </div>
                </div>
              )}

              {/* 2. البحث بالكلمة والتشكيل */}
              {searchMethod === "word" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">أدخل الكلمة القرآنية</label>
                    <input
                      type="text"
                      placeholder="مثال: قالوا"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-3 font-serif rounded-radius border border-input bg-popover text-popover-foreground text-right focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {matchedWords.length > 0 && (
                    <div className="p-3 bg-muted rounded-radius border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">اختر التشكيل المطلوب للكلمة:</p>
                      <div className="flex flex-wrap gap-2">
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

                  {selectedWord && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">الآيات التي تحتوي الكلمة بالتشكيل المحدد:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
                        {selectedWord.occurrences.map((occ) => {
                          const key = `${occ.surah}:${occ.ayah}`;
                          const verse = MOCK_VERSES_BY_RECITATION[globalRecitation][key];
                          return (
                            <button
                              key={key}
                              onClick={() => handleSelectVerse(key)}
                              className={`w-full p-3 text-right rounded-radius border flex flex-col justify-between items-start transition-colors ${activeVerseKey === key ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-border hover:bg-accent/20"}`}
                            >
                              <span className="text-xs font-mono font-semibold text-primary">سورة {occ.surah}، آية {occ.ayah}</span>
                              <span className="text-base font-serif mt-1 w-full">{verse?.text_arabic || "الآية غير متوفرة"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. الإدخال بأحكام التجويد (الإدغام) */}
              {searchMethod === "tajweed" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">اختر حالات الإدغام (توالي الحروف):</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MOCK_TAJWEED_IDGHAM.map((rule) => (
                        <button
                          key={rule.rule_id}
                          onClick={() => setSelectedTajweedRule(rule)}
                          className={`p-3 rounded-radius text-right border transition-all flex flex-col ${selectedTajweedRule?.rule_id === rule.rule_id ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-input hover:bg-accent/30"}`}
                        >
                          <span className="text-lg font-bold font-mono text-primary">{rule.letters_pair}</span>
                          <span className="text-xs text-muted-foreground mt-1">{rule.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTajweedRule && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">الآيات التي تحتوي الحكم:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
                        {selectedTajweedRule.occurrences.map((occ) => {
                          const key = `${occ.surah}:${occ.ayah}`;
                          const verse = MOCK_VERSES_BY_RECITATION[globalRecitation][key];
                          return (
                            <button
                              key={key}
                              onClick={() => handleSelectVerse(key)}
                              className={`w-full p-3 text-right rounded-radius border flex flex-col justify-between items-start transition-colors ${activeVerseKey === key ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-border hover:bg-accent/20"}`}
                            >
                              <span className="text-xs font-mono font-semibold text-primary">سورة {occ.surah}، آية {occ.ayah}</span>
                              <span className="text-base font-serif mt-1 w-full">{verse?.text_arabic || "الآية غير متوفرة"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* مشغل الصوت MP3 المباشر والمستقر */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md flex flex-col items-center justify-center space-y-4 min-h-[220px]">
              
              {/* عنصر الصوت المباشر مخفي أو ظاهر بصورة مصممة */}
              <audio
                ref={audioRef}
                src={RECITATION_AUDIO_PATHS[globalRecitation]}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full mt-2"
                controls
              />

              {activeVerse ? (
                <div className="w-full flex items-center justify-between bg-muted/50 p-4 rounded-radius border border-border">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary block">
                      التلاوة النشطة: سورة {activeVerse.surah_number} - الآية {activeVerse.ayah_number}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      موقع التوقيت بالمقطع: {activeVerse.start_time_seconds} ثانية
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
                <p className="text-xs text-muted-foreground text-center">
                  اختر آية من الخيارات أعلاه للقفز الفوري لملف الـ MP3 وسماع التلاوة.
                </p>
              )}
            </div>

          </div>

          {/* العمود الثالث: اللوحة التفسيرية والتجويدية */}
          <div className="space-y-6">
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md h-full space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold border-b border-border pb-2 text-primary font-serif">اللوحة التعليمية والتفسيرية</h2>

                {activeVerse ? (
                  <div className="space-y-6 mt-4">
                    {/* نص الآية الحالي */}
                    <div>
                      <span className="inline-block text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius font-semibold mb-2">
                        سورة {activeVerse.surah_number} : آية {activeVerse.ayah_number}
                      </span>
                      <p className="text-xl font-serif text-right border-l-4 border-accent pl-0 pr-3 py-1 bg-muted/40 rounded-r-radius">
                        {activeVerse.text_arabic}
                      </p>
                    </div>

                    {/* التفسير */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">التفسير والبيان</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.tafseer}
                      </p>
                    </div>

                    {/* التجويد والنطق */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">دليل النطق والتجويد</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.recitation_guide}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 text-sm">
                    اختر آية لعرض تفسيرها وإرشادات تجويدها الصوتية هنا.
                  </div>
                )}
              </div>

              {/* فوتر اللوحة */}
              <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center font-mono">
                <span>تنسيق الملف: MP3</span>
                <span>المشغل: HTML5 Audio API</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}