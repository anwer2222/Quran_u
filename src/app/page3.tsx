"use client";

import React, { useState, useEffect } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";

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
}

interface TajweedRule {
  rule_id: string;
  letters_pair: string; // مثال: "ن - م"
  description: string;  // مثال: "إدغام بغنة"
  occurrences: WordOccurrence[];
}

// --- البيانات التجريبية المعدلة لتناسب الروايات وأحكام الإدغام ---
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

// محاكاة بيانات الآيات لكل رواية (حفص ورش كمثال)
const MOCK_VERSES_BY_RECITATION: Record<string, Record<string, VerseData>> = {
  hafs: {
    "2:30": {
      surah_number: 2,
      ayah_number: 30,
      text_arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
      tafseer: "تفسير رواية حفص: واذكر -أيها الرسول- للناس حين قال ربك للملائكة: إني جاعل في الأرض خلفاء...",
      recitation_guide: "تنبيه تجويدي (حفص): انتبه للمد المتصل في 'لِلْمَلَائِكَةِ' بمقدار 4 أو 5 حركات، والغنة في 'إِنِّي'.",
      start_time_seconds: 1245 // التوقيت برواية حفص
    },
    "3:15": {
      surah_number: 3,
      ayah_number: 15,
      text_arabic: "قُلْ أَؤُنَبِّئُكُمْ بِخَيْرٍ مِنْ ذَٰلِكُمْ",
      tafseer: "تفسير رواية حفص: قل -أيها الرسول-: أأخبركم بعاقبة خير من ذلكم المتاع الدنيوي؟",
      recitation_guide: "تنبيه تجويدي (حفص): تحقيق الهمزتين في 'أَؤُنَبِّئُكُمْ' وإخفاء النون الساكنة في 'مِنْ ذَٰلِكُمْ'.",
      start_time_seconds: 2450
    }
  },
  warsh: {
    "2:30": {
      surah_number: 2,
      ayah_number: 30,
      text_arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَٰٓئِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً",
      tafseer: "تفسير رواية ورش: واذكر حين قال ربك للملائكة إني جاعل في الأرض خلفاء (مع مراعاة أصول نافع)...",
      recitation_guide: "تنبيه تجويدي (ورش): مد البدل والمد المتصل يمد بمقدار 6 حركات (الإشباع)، ونقل حركة الهمزة في 'فِي الْأَرْضِ'.",
      start_time_seconds: 1320 // توقيت مختلف محاكي لنسخة تلاوة ورش
    },
    "3:15": {
      surah_number: 3,
      ayah_number: 15,
      text_arabic: "قُلْ أَؤُنَبِّئُكُم بِخَيْرٍ مِّن ذَٰلِكُمْ",
      tafseer: "تفسير رواية ورش: قل أأخبركم بخير من ذلكم، مع تسهيل الهمزة الثانية عند ورش.",
      recitation_guide: "تنبيه تجويدي (ورش): تسهيل الهمزة الثانية في 'أَؤُنَبِّئُكُم' وإسقاط النقل وضمه صلة ميم الجمع.",
      start_time_seconds: 2580
    }
  }
};

// خيارات الإدغام (حروف الإدغام بغنة وبغير غنة)
const MOCK_TAJWEED_IDGHAM: TajweedRule[] = [
  {
    rule_id: "n_m",
    letters_pair: "ن - م",
    description: "إدغام بغنة (توالي النون الساكنة أو التنوين مع الميم)",
    occurrences: [{ surah: 3, ayah: 15 }] // مثال: بـخـيـرٍ مِّـن
  },
  {
    rule_id: "n_y",
    letters_pair: "ن - ي",
    description: "إدغام بغنة (توالي النون الساكنة أو التنوين مع الياء)",
    occurrences: [{ surah: 2, ayah: 30 }] // مثال: مَن يَقُول
  }
];

const MASTER_YOUTUBE_VIDEO_ID = "wkXufgycbd4"; // معرف فيديو اليوتيوب الموحد

export default function QuranSearchPage() {
  // خيار الرواية العالمي
  const [globalRecitation, setGlobalRecitation] = useState<"hafs" | "warsh">("hafs");

  // طرق الإدخال الثلاثة
  const [searchMethod, setSearchMethod] = useState<"structure" | "word" | "tajweed">("structure");
  
  // طريقة 1: السورة والآية
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [selectedAyahNum, setSelectedAyahNum] = useState<string>("");
  
  // طريقة 2: البحث بكلمة
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matchedWords, setMatchedWords] = useState<WordIndex[]>([]);
  const [selectedWord, setSelectedWord] = useState<WordIndex | null>(null);

  // طريقة 3: التجويد (الإدغام)
  const [selectedTajweedRule, setSelectedTajweedRule] = useState<TajweedRule | null>(null);
  
  // التحكم في الآية النشطة والمشغل
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  // دالة تنظيف التشكيل للمطابقة التقريبية
  const stripTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u065F\u0670]/g, "");
  };

  // معالجة البحث عن كلمة
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

  // تحديث تلقائي للآية عند إدخال السورة والآية يدوياً
  useEffect(() => {
    if (searchMethod === "structure" && selectedSurah && selectedAyahNum) {
      const key = `${selectedSurah}:${selectedAyahNum}`;
      if (MOCK_VERSES_BY_RECITATION[globalRecitation][key]) {
        setActiveVerseKey(key);
      }
    }
  }, [selectedSurah, selectedAyahNum, searchMethod, globalRecitation]);

  // معالجة الانتقال الآمن للتوقيت داخل اليوتيوب لتجنب أخطاء المتصفح اللحظية
  useEffect(() => {
    const currentRecitationData = MOCK_VERSES_BY_RECITATION[globalRecitation];
    if (player && typeof player.seekTo === "function" && activeVerseKey && currentRecitationData[activeVerseKey]) {
      const timeoutId = setTimeout(() => {
        try {
          if (player.getIframe()) {
            const startTime = currentRecitationData[activeVerseKey].start_time_seconds;
            player.seekTo(startTime, true);
            player.playVideo();
          }
        } catch (err) {
          console.warn("إعادة محاولة الاتصال بمشغل يوتيوب:", err);
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [activeVerseKey, player, globalRecitation]);

  // جلب بيانات الآية الحالية بناءً على الرواية المحددة
  const activeVerse = activeVerseKey && MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey] 
    ? MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey] 
    : null;

  return (
    <main dir="rtl" className="min-h-screen font-sans bg-background text-foreground antialiased p-spacing md:p-8 tracking-normal">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* الهيدر وخيار الرواية العالمي */}
        <header className="border-b border-border pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary">محرك بحث تلاوات القرآن الكريم</h1>
            <p className="text-muted-foreground text-sm">تعلم النطق الصحيح وأحكام التجويد من خلال ربط الآيات بالتلاوات مباشرة.</p>
          </div>
          
          {/* الميزة 2: التحكم العالمي بالرواية القرآنية */}
          <div className="bg-card border border-border p-3 rounded-radius shadow-sm flex items-center space-x-reverse space-x-3">
            <span className="text-xs font-medium text-muted-foreground font-serif">رواية التلاوة الحالية:</span>
            <select
              value={globalRecitation}
              onChange={(e) => {
                setGlobalRecitation(e.target.value as "hafs" | "warsh");
                // عند تغيير الرواية، يتم تحديث التوقيت تلقائياً للآية المفتوحة حالياً
              }}
              className="p-1.5 text-xs rounded-radius border border-input bg-popover text-popover-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
            >
              <option value="hafs">حفص عن عاصم</option>
              <option value="warsh">ورش عن نافع</option>
              <option value="warsh1">قالون عن نافع</option>
            </select>
          </div>
        </header>

        {/* لوحة التحكم الرئيسية والمشغل */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* العمود 1 و 2: خيارات البحث والمشغل */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* أزرار طرق الإدخال الثلاثة */}
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

              {/* طريقة أ: اختيار السورة والآية */}
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

              {/* طريقة ب: البحث بالكلمة والتشكيل */}
              {searchMethod === "word" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">أدخل الكلمة القرآنية للبحث</label>
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
                      <p className="text-xs font-medium text-muted-foreground mb-2">اختر اللفظ بالرسم والتشكيل الصحيح:</p>
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
                      <p className="text-xs font-medium text-muted-foreground">اختر الآية المطلوبة لعرض التلاوة مفرونة بالكلمة:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
                        {selectedWord.occurrences.map((occ) => {
                          const key = `${occ.surah}:${occ.ayah}`;
                          const verse = MOCK_VERSES_BY_RECITATION[globalRecitation][key];
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveVerseKey(key)}
                              className={`w-full p-3 text-right rounded-radius border flex flex-col justify-between items-start transition-colors ${activeVerseKey === key ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-border hover:bg-accent/20"}`}
                            >
                              <span className="text-xs font-mono font-semibold text-primary">سورة رقم {occ.surah}، الآية {occ.ayah}</span>
                              <span className="text-base font-serif mt-1 w-full">{verse?.text_arabic || "نص الآية غير متوفر في هذه الرواية"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* الميزة 1: طريقة الإدخال الثالثة المبنية على أحكام التجويد (الإدغام) */}
              {searchMethod === "tajweed" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">اختر علاقة الحروف المكونة لحكم الإدغام:</label>
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
                      <p className="text-xs font-medium text-muted-foreground">الآيات التي تحتوي على هذا الإدغام بالرواية الحالية:</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 pl-1">
                        {selectedTajweedRule.occurrences.map((occ) => {
                          const key = `${occ.surah}:${occ.ayah}`;
                          const verse = MOCK_VERSES_BY_RECITATION[globalRecitation][key];
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveVerseKey(key)}
                              className={`w-full p-3 text-right rounded-radius border flex flex-col justify-between items-start transition-colors ${activeVerseKey === key ? "bg-accent text-accent-foreground border-accent" : "bg-popover text-popover-foreground border-border hover:bg-accent/20"}`}
                            >
                              <span className="text-xs font-mono font-semibold text-primary">سورة رقم {occ.surah}، الآية {occ.ayah}</span>
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

            {/* مشغل الفيديو المستقر بالتوقيت التلقائي النظيف */}
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md flex flex-col items-center justify-center min-h-[360px]">
              {activeVerseKey && MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey] ? (
                <div className="w-full aspect-video rounded-radius overflow-hidden shadow-lg border border-border bg-black">
                  <YouTube
                    key={`${globalRecitation}_${activeVerseKey}`} // إعادة بناء العنصر عند تغيير الرواية أو الآية لضمان حقن المكون بسلاسة
                    videoId={MASTER_YOUTUBE_VIDEO_ID}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        start: MOCK_VERSES_BY_RECITATION[globalRecitation][activeVerseKey].start_time_seconds,
                        origin: typeof window !== "undefined" ? window.location.origin : "",
                      },
                    }}
                    onReady={(e) => setPlayer(e.target)}
                    iframeClassName="w-full h-full aspect-video border-0"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground space-y-2">
                  <div className="text-4xl text-accent">🎦</div>
                  <p className="text-sm font-medium">المشغل في وضع الاستعداد</p>
                  <p className="text-xs max-w-sm mx-auto text-muted-foreground">يرجى تحديد السورة/الآية، أو البحث بكلمة، أو اختيار حكم التجويد من الخيارات أعلاه ليتم تشغيل الآية مباشرة بالتوقيت الصحيح.</p>
                </div>
              )}
            </div>
          </div>

          {/* العمود 3: اللوحة الجانبية للتفسير وأحكام التجويد باللغة العربية */}
          <div className="space-y-6">
            <div className="bg-card text-card-foreground p-6 rounded-radius border border-border shadow-md h-full space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold border-b border-border pb-2 text-primary font-serif">اللوحة التفسيرية والتعليمية</h2>
                
                {activeVerse ? (
                  <div className="space-y-6 mt-4">
                    {/* عرض سياق الآية المصغرة */}
                    <div>
                      <span className="inline-block text-xs font-mono bg-secondary text-secondary-foreground px-2 py-0.5 rounded-radius font-semibold mb-2">
                        معطيات موضع الآية — {activeVerse.surah_number}:{activeVerse.ayah_number}
                      </span>
                      <p className="text-xl font-serif text-right border-l-4 border-accent pl-0 pr-3 py-1 bg-muted/40 rounded-r-radius">
                        {activeVerse.text_arabic}
                      </p>
                    </div>

                    {/* نافذة التفسير */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">التفسير والبيان</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.tafseer}
                      </p>
                    </div>

                    {/* نافذة التجويد ومخارج الحروف */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">دليل نطق الآية وتجويدها</h3>
                      <p className="text-sm leading-relaxed text-foreground/90 bg-popover p-3 rounded-radius border border-border">
                        {activeVerse.recitation_guide}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 text-sm">
                    لم يتم اختيار آية نشطة حالياً. قم باختيار آية لعرض التفسير والملحوظات التجويدية للرواية المختارة.
                  </div>
                )}
              </div>

              {/* الفوتر الصغير للوحة */}
              <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex justify-between items-center font-mono">
                <span>تزامن المقطع الرئيسي: نشط</span>
                <span>الحالة: جاهز</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}