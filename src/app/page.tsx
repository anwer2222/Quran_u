"use client"
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, Book, BarChart2, List, Layers, ArrowLeft, 
  X, Activity, RefreshCw, FileText, Check, 
  AlertCircle, Sparkles, BookOpen, Info, Compass, 
  LayoutGrid, Download
} from 'lucide-react';
import QuranAudioSearchPage from './language_components';

// Custom CSS styling block to inject Riyadh-Cairo-Amiri Arabic Typography 
// and custom wavy background graphics inspired by "منصة فلك - مدونة القرآن الكريم.jpg"
const CustomStyleBlock = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      direction: rtl;
      background-color: #f7faf9;
    }

    .quran-text {
      font-family: 'Amiri', serif;
      font-size: 1.6rem;
      line-height: 2.3;
      text-align: center;
    }

    /* Wave curves inspired by Falak brand */
    .wavy-bg {
      background: linear-gradient(135deg, #093731 0%, #0d4a42 100%);
      position: relative;
      overflow: hidden;
    }
    .wavy-bg::before {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: radial-gradient(circle at 15% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 55%),
                  radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 45%);
      pointer-events: none;
    }

    /* Elegant Custom Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    ::-webkit-scrollbar-thumb {
      background: #10b981;
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #0d9488;
    }
  `}} />
);

const SURAHS_DATABASE = [
  { id: 1, name: "الفاتحة", type: "مكية", verses: 7, words: 29, uniqueWords: 21, order: 5, revelationNo: 5 },
  { id: 2, name: "البقرة", type: "مدنية", verses: 286, words: 6116, uniqueWords: 1810, order: 87, revelationNo: 87 },
  { id: 3, name: "آل عمران", type: "مدنية", verses: 200, words: 3480, uniqueWords: 1240, order: 89, revelationNo: 89 },
  { id: 4, name: "النساء", type: "مدنية", verses: 176, words: 3745, uniqueWords: 1195, order: 92, revelationNo: 92 },
  { id: 5, name: "المائدة", type: "مدنية", verses: 120, words: 2804, uniqueWords: 994, order: 112, revelationNo: 112 },
  { id: 6, name: "الأنعام", type: "مكية", verses: 165, words: 3055, uniqueWords: 1045, order: 55, revelationNo: 55 },
  { id: 7, name: "الأعراف", type: "مكية", verses: 206, words: 3325, uniqueWords: 1110, order: 39, revelationNo: 39 },
  { id: 18, name: "الكهف", type: "مكية", verses: 110, words: 1577, uniqueWords: 712, order: 69, revelationNo: 69 },
  { id: 36, name: "يس", type: "مكية", verses: 83, words: 729, uniqueWords: 385, order: 41, revelationNo: 41 },
  { id: 55, name: "الرحمن", type: "مكية", verses: 78, words: 351, uniqueWords: 170, order: 97, revelationNo: 97 },
  { id: 56, name: "الواقعة", type: "مكية", verses: 96, words: 378, uniqueWords: 205, order: 46, revelationNo: 46 },
  { id: 67, name: "الملك", type: "مكية", verses: 30, words: 330, uniqueWords: 168, order: 77, revelationNo: 77 },
  { id: 112, name: "الإخلاص", type: "مكية", verses: 4, words: 15, uniqueWords: 10, order: 22, revelationNo: 22 },
  { id: 113, name: "الفلق", type: "مكية", verses: 5, words: 23, uniqueWords: 13, order: 20, revelationNo: 20 },
  { id: 114, name: "الناس", type: "مكية", verses: 6, words: 20, uniqueWords: 11, order: 21, revelationNo: 21 }
];

const VERSES_DATABASE = [
  { text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", surah: "الفاتحة", verseNo: 2, textClean: "الحمد لله رب العالمين" },
  { text: "الرَّحْمَنِ الرَّحِيمِ", surah: "الفاتحة", verseNo: 3, textClean: "الرحمن الرحيم" },
  { text: "مَالِكِ يَوْمِ الدِّينِ", surah: "الفاتحة", verseNo: 4, textClean: "مالك يوم الدين" },
  { text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", surah: "الفاتحة", verseNo: 5, textClean: "إياك نعبد وإياك نستعين" },
  { text: "ذَلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ", surah: "البقرة", verseNo: 2, textClean: "ذلك الكتاب لا ريب فيه هدى للمتقين" },
  { text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", surah: "البقرة", verseNo: 255, textClean: "الله لا إله إلا هو الحي القيوم" },
  { text: "يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ", surah: "البقرة", verseNo: 21, textClean: "يا أيها الناس اعبدوا ربكم الذي خلقكم" },
  { text: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ", surah: "البقرة", verseNo: 185, textClean: "شهر رمضان الذي أنزل فيه القرآن هدى للناس" },
  { text: "الرَّحْمَنُ * عَلَّمَ الْقُرْآنَ * خَلَقَ الْإِنسَانَ", surah: "الرحمن", verseNo: "1-3", textClean: "الرحمن علم القرآن خلق الإنسان" },
  { text: "قُلْ هُوَ اللَّهُ أَحَدٌ * اللَّهُ الصَّمَدُ", surah: "الإخلاص", verseNo: "1-2", textClean: "قل هو الله أحد الله الصمد" },
  { text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", surah: "الفلق", verseNo: 1, textClean: "قل أعوذ برب الفلق" },
  { text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ * مَلِكِ النَّاسِ * إِلَهِ النَّاسِ", surah: "الناس", verseNo: "1-3", textClean: "قل أعوذ برب الناس ملك الناس إله الناس" },
  { text: "إِنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", surah: "البقرة", verseNo: 20, textClean: "إن الله على كل شيء قدير" },
  { text: "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", surah: "البقرة", verseNo: 173, textClean: "إن الله غفور رحيم" }
];

const WORD_FREQUENCY_DATA = [
  { word: "الله", count: 2418, percentage: 3.12 },
  { word: "إن", count: 1007, percentage: 1.30 },
  { word: "الذين", count: 851, percentage: 1.10 },
  { word: "لا", count: 830, percentage: 1.07 },
  { word: "إلا", count: 685, percentage: 0.88 },
  { word: "ما", count: 657, percentage: 0.85 },
  { word: "قال", count: 413, percentage: 0.53 },
  { word: "لهم", count: 390, percentage: 0.50 },
  { word: "من", count: 369, percentage: 0.48 },
  { word: "يا", count: 359, percentage: 0.46 },
  { word: "الأرض", count: 292, percentage: 0.38 },
  { word: "ذلك", count: 292, percentage: 0.38 },
  { word: "آمنوا", count: 281, percentage: 0.36 },
  { word: "ربك", count: 217, percentage: 0.28 },
  { word: "يوم", count: 217, percentage: 0.28 },
  { word: "السموات", count: 185, percentage: 0.24 },
  { word: "عذاب", count: 149, percentage: 0.19 },
  { word: "الرحمن", count: 156, percentage: 0.20 },
  { word: "الرحيم", count: 145, percentage: 0.18 },
  { word: "موسى", count: 130, percentage: 0.17 },
  { word: "الكتاب", count: 173, percentage: 0.22 },
  { word: "الحق", count: 108, percentage: 0.14 },
  { word: "الناس", count: 194, percentage: 0.25 },
  { word: "ربهم", count: 109, percentage: 0.14 }
];

const COLLOCATIONS_DATA = [
  { baseWord: "الله", collocate: "رسول", position: "يمين", count: 332, tScore: 18.2, mutualInfo: 9.4, logDice: 8.5 },
  { baseWord: "الله", collocate: "إن", position: "يمين", count: 280, tScore: 16.5, mutualInfo: 7.2, logDice: 6.9 },
  { baseWord: "الله", collocate: "سبيل", position: "يمين", count: 160, tScore: 12.6, mutualInfo: 10.1, logDice: 8.1 },
  { baseWord: "الرحمن", collocate: "بسم", position: "يمين", count: 114, tScore: 10.6, mutualInfo: 12.4, logDice: 9.8 },
  { baseWord: "الرحمن", collocate: "الرحيم", position: "يسار", count: 114, tScore: 10.6, mutualInfo: 11.2, logDice: 9.4 },
  { baseWord: "رب", collocate: "العالمين", position: "يسار", count: 42, tScore: 6.4, mutualInfo: 13.1, logDice: 10.2 }
];

const NGrams_DATA = [
  { phrase: "بسم الله الرحمن", length: 3, count: 114, frequency: 0.14 },
  { phrase: "الله الرحمن الرحيم", length: 3, count: 114, frequency: 0.14 },
  { phrase: "الحمد لله رب", length: 3, count: 42, frequency: 0.05 },
  { phrase: "لله رب العالمين", length: 3, count: 42, frequency: 0.05 },
  { phrase: "يا أيها الذين", length: 3, count: 360, frequency: 0.46 },
  { phrase: "أيها الذين آمنوا", length: 3, count: 305, frequency: 0.39 },
  { phrase: "إن الله على", length: 3, count: 120, frequency: 0.15 },
  { phrase: "على كل شيء", length: 3, count: 160, frequency: 0.20 },
  { phrase: "كل شيء قدير", length: 3, count: 120, frequency: 0.15 }
];

export default function App() {
  const [activeTool, setActiveTool] = useState<'home' | 'concordance' | 'frequency' | 'ngrams' | 'collocates' | 'affixes' | 'collocations' | 'distribution' | 'examples' | 'terminology' | 'statistics' | 'compos'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [filterSurahType, setFilterSurahType] = useState<'جميع' | 'مكية' | 'مدنية'>('جميع');
  const [surahSearch, setSurahSearch] = useState('');
  const [showStopWords, setShowStopWords] = useState(true);
  const [frequencyLimit, setFrequencyLimit] = useState(20);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Virtual Keyboard interactions
  const handleKeyTap = (char: string) => {
    if (char === 'مسح') {
      setSearchQuery('');
    } else if (char === 'تراجع') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (char === 'مسافة') {
      setSearchQuery(prev => prev + ' ');
    } else {
      setSearchQuery(prev => prev + char);
    }
  };

  const arabicKeys = [
    ['د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض'],
    ['ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش'],
    ['ة', 'و', 'ز', 'ر', 'ذ', 'ئ', 'ء', 'ؤ', 'إ', 'أ', 'آ', 'لا'],
    ['تراجع', 'مسافة', 'مسح']
  ];

  const filteredSurahs = useMemo(() => {
    return SURAHS_DATABASE.filter(s => {
      const matchesType = filterSurahType === 'جميع' || s.type === filterSurahType;
      const matchesSearch = s.name.includes(surahSearch);
      return matchesType && matchesSearch;
    });
  }, [filterSurahType, surahSearch]);

  const concordanceResults = useMemo(() => {
    if (!searchQuery.trim()) return VERSES_DATABASE;
    return VERSES_DATABASE.filter(v => 
      v.textClean.includes(searchQuery) || v.text.includes(searchQuery)
    );
  }, [searchQuery]);

  const wordFrequencyResults = useMemo(() => {
    let result = WORD_FREQUENCY_DATA;
    if (!showStopWords) {
      const stops = ["إن", "لا", "إلا", "ما", "من", "يا", "ذلك", "لهم"];
      result = result.filter(w => !stops.includes(w.word));
    }
    return result.slice(0, frequencyLimit);
  }, [showStopWords, frequencyLimit]);

  const highlightWord = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="bg-amber-100 text-amber-900 px-1 rounded font-bold border-b-2 border-amber-500">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF9] text-slate-800 antialiased selection:bg-teal-700 selection:text-white mb-10">
      <CustomStyleBlock />

      {/* 
        PREMIUM HEADER (Deep wavy dark green teal matching the top of "منصة فلك - مدونة القرآن الكريم.jpg")
      */}
      <header className="text-white z-40 my-5">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 wavy-bg rounded-4xl">
          <div className="flex h-15 gap-14 items-center">

            {/* Brand Logo & Title (Falak Arabic brand identifier on top right of the page) */}
            <div className="flex items-center mb-2">
              {/* <div className="text-right">
                <span className="text-xl font-black text-white tracking-wide block">فَـلَـك</span>
                <span className="text-[10px] text-teal-200 font-medium">مجمع الملك سلمان العالمي للغة العربية</span>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-center">
                <Compass className="w-6 h-6 text-amber-400" />
              </div> */}
              <Image src="/falak-logo-light.svg" width={100} height={50} alt=''/>
            </div>
            
            {/* Nav Menu centered/right */}
            <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-teal-50">
              <a href="#" className="hover:text-amber-300 transition-colors">الرئيسة</a>
              <a href="#" className="hover:text-amber-300 transition-colors">عن فلك</a>
              <a href="#" className="text-white font-semibold border-b-2 border-teal-400 pb-1">المدونات</a>
              <a href="#" className="hover:text-amber-300 transition-colors">الجدارية الصوتية</a>
              <a href="#" className="hover:text-amber-300 transition-colors">اتصل بنا</a>
            </nav>

          </div>
        </div>
      </header>

      {/* 
        BREADCRUMBS & DROPDOWNS BAR (Centered "مدونة القرآن الكريم" with modern path navigation)
      */}
      <div className="bg-white border-b border-slate-100 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-row sm:flex-row justify-between items-center">
          
          {/* Main Title Banner */}
          <div className="max-w-7xl mx-auto pb-15 px-4 sm:px-6 lg:px-8 md:pb-20">
                <h1 className="text-2xl sm:text-3.5xl font-black text-center text-[#0e4e46] tracking-tight">
                مدونة القرآن الكريم
                </h1>
          </div>
          <div className="flex justify-between items-center">
          {/* Breadcrumbs aligned on the right */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500">
            <span className="hover:text-[#00a28a] cursor-pointer">الرئيسة</span>
            <span className="text-green-700 text-2xl">›</span>
            <span className="hover:text-[#00a28a] cursor-pointer">المدونات</span>
            <span className="text-green-700 text-2xl">›</span>
            <span className="text-[#00a28a] font-bold">مدونة القرآن الكريم</span>
          </div>

          

          {/* Dropdown with info icon on the left */}
          <div className="flex items-center gap-3 sm:w-auto lg:justify-start justify-center">
            
            <div className="relative">
              <button className="bg-[#00a28a] hover:bg-[#008f79] text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                <span>مدونة القرآن الكريم</span>
                <span className="text-[10px]">▼</span>
              </button>
            </div>

            <button 
              onClick={() => setIsDetailsModalOpen(true)}
              className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
              title="معلومات"
            >
              <Info size={16} />
            </button>
          </div>

          </div>

        </div>
      </div>

      

      {}
      {/* 
        MAIN CONTENT BODY: Left is White Information panel, Right is the Vertical Icons Sidebar.
      */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-start gap-15">

          {/* SIDE BAR: MAIN */}
          <div className="lg:col-span-2 hidden md:block bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex-col items-center gap-1 w-25">
            
            {/* Top Indicator / Logo trigger */}
            <button 
              onClick={() => setActiveTool('home')}
              className="w-12 h-12 bg-teal-50/50 rounded-2xl flex items-center justify-center text-[#00a28a] border border-teal-100/50 hover:bg-teal-100/50 transition-colors mb-4"
              title="رئيسية المدونة"
            >
              <Image src="/icon/falak-logo-without-text.svg" alt='' height={30} width={30}/>
            </button>

            {/* Sidebar Tools Grid / Scrollable list */}
            <div className="w-full space-y-1">
              {[
                { id: 'compos', label: 'الظواهر الصوتية', icon: "/icon/tool-ngrams.svg" },
                { id: 'distribution', label: 'التراكيب اللغوية', icon: "/icon/tool-search.svg"  },
                { id: 'concordance', label: 'الكشاف السياقي', icon: "/icon/tool-concordancer.svg" },
                { id: 'frequency', label: 'قوائم الشيوع', icon: "/icon/tool-words-frequency-lists.svg" },
                { id: 'ngrams', label: 'التتابعات اللفظية', icon: "/icon/tool-ngrams.svg" },
                { id: 'collocates', label: 'الكلمات السابقة واللاحقة', icon: "/icon/tool-words-before-after.svg"  },
                { id: 'affixes', label: 'السوابق واللواحق', icon: "/icon/tool-prefixes-and-suffixes.svg" },
                { id: 'collocations', label: 'التصاحب اللفظي', icon: "/icon/tool-collocation.svg" },
                { id: 'distribution', label: 'توزيع التكرار', icon: "/icon/tool-frequency-distribution.svg" },
                { id: 'examples', label: 'البحث عن أمثلة', icon: "/icon/tool-search.svg" },
                { id: 'terminology', label: 'استخلاص المصطلحات', icon: "/icon/tool-keywords.svg" },
                { id: 'statistics', label: 'الإحصائيات', icon: "/icon/statistics-period.svg" }
              ].map(tool => {
                const IconComponent = tool.icon? tool.icon: "/icon/tool-concordancer.svg";
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id as any)}
                    className={`w-full group flex flex-col items-center p-3 rounded-2xl text-center transition-all ${
                      isSelected 
                        ? 'bg-teal-50 border border-teal-200/50 text-[#00a28a]' 
                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    {/* Circle icon frame */}
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'border-[#00a28a] bg-white text-[#00a28a] shadow-sm' 
                        : 'border-slate-100 bg-slate-50 group-hover:border-slate-300'
                    }`}>
                      <Image src={IconComponent} alt='' height={30} width={30}/>
                    </div>
                    {/* Small Arabic title label */}
                    <span className="text-[10px] font-extrabold mt-2 leading-tight select-none">
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          
          {/* RIGHT SIDE: MAIN White interactive display card */}
          <div className="lg:col-span-10 bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.03)] min-h-[640px] flex flex-col">
            
            {/* Tool View 1: Default Home / Stats view (Exactly matching the layout in "منصة فلك - مدونة القرآن الكريم.jpg") */}
            {activeTool === 'home' && (
              <div className="space-y-10 flex-1 flex flex-col">
                
                {/* King Salman Academy Arabic Logo Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="text-right max-w-xl">
                    <p className="text-[13px] leading-relaxed text-slate-500">
                      <strong className="text-[#00a28a] font-black text-sm">وصف المدونة: </strong>
                      مدونة لغوية تُمثّل نصوص الآيات القرآنية كاملة، مع تصنيف نوعها (مكية أو مدنية) وعدد الآيات لكل سورة. تُمكِّن المدونة الباحثين في الدراسات القرآنية أو اللغوية من الوصول إلى نتائج تستند على أدواتها.
                    </p>
                  </div>
                  
                  {/* Decorative visual representation of the Academy's seal */}
                  <Image src="/logo-2.png" alt='' width={150} height={70}/>
                </div>

                {/* Main Interactive Search Input Component */}
                <div className="max-w-2xl mx-auto w-full space-y-4 pt-4">
                  <div className="flex items-center gap-2">
                    {/* Teal search execution button */}
                    <button 
                      onClick={() => {
                        if (searchQuery.trim()) {
                          setActiveTool('concordance');
                        }
                      }}
                      className="bg-[#00a28a] hover:bg-[#008f79] text-white text-xs sm:text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-teal-500/10 whitespace-nowrap"
                    >
                      بحث
                    </button>

                    {/* Styled Search Field with inside keyboard trigger */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث في المدونة"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#00a28a] focus:bg-white transition-all text-right text-slate-800"
                      />
                      <button 
                        onClick={() => setKeyboardOpen(!keyboardOpen)}
                        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                        title="لوحة المفاتيح"
                      >
                        {/* Keypad Icon SVG mimicking screenshot keyboard visual */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2m-4 0H5m3 4h8M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Virtual Keyboard Expansion */}
                  {keyboardOpen && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-slideDown">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400">لوحة المفاتيح الافتراضية للبحث</span>
                        <button onClick={() => setKeyboardOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {arabicKeys.map((row, idx) => (
                          <div key={idx} className="flex justify-center gap-1">
                            {row.map(key => {
                              const isSpecial = ['تراجع', 'مسافة', 'مسح'].includes(key);
                              return (
                                <button
                                  key={key}
                                  onClick={() => handleKeyTap(key)}
                                  className={`py-2 px-1 sm:px-2.5 rounded text-xs font-semibold transition-all ${
                                    isSpecial
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white flex-1 max-w-[80px]'
                                      : 'bg-white hover:bg-slate-200 text-slate-800 shadow-sm active:scale-95'
                                  }`}
                                >
                                  {key}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {}
                {/* 
                  CIRCULAR METRIC BADGES (Exactly mirroring the three circles in "منصة فلك - مدونة القرآن الكريم.jpg")
                */}
                <div className="space-y-6 pt-6">
                  <div className="flex justify-center">
                    <span className="bg-[#00a28a] text-white text-xs font-black px-6 py-2.5 rounded-full shadow-inner tracking-wider">
                      الإحصائيات
                    </span>
                  </div>

                  <div className="grid grid-cols-3 max-w-xl mx-auto text-center">
                    {/* Circle 1: Number of Texts */}
                    <div className="flex flex-col items-center">
                        <Image src="/icon/icon-documents.svg" alt='' height={50} width={50}/>
                      <span className="text-[10px] sm:text-xs font-bold text-[#0e4e46] mt-3">عدد النصوص</span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-500 mt-0.5">114</span>
                    </div>

                    {/* Circle 2: Number of Words */}
                    <div className="flex flex-col items-center">
                    <Image src="/icon/icon-words.svg" alt='' height={50} width={50}/>
                      
                      <span className="text-[10px] sm:text-xs font-bold text-[#0e4e46] mt-3">عدد الكلمات</span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-500 mt-0.5">77,439</span>
                    </div>

                    {/* Circle 3: Unique Words (بدون تكرار) */}
                    <div className="flex flex-col items-center">
                    <Image src="/icon/icon-words-nofreq.svg" alt='' height={50} width={50}/>
                      <span className="text-[10px] sm:text-xs font-bold text-[#0e4e46] mt-3">عدد الكلمات بدون تكرار</span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-500 mt-0.5">14,870</span>
                    </div>
                  </div>
                </div>

                {}
                {/* 
                  VISUAL WORD CLOUD SECTION (Directly reproducing the term arrangement in the JPG image)
                */}
                <div className="space-y-6 pt-6 flex-1 flex flex-col justify-end">
                  <div className="flex justify-center">
                    <span className="bg-[#00a28a] text-white text-xs font-black px-6 py-2.5 rounded-full shadow-inner tracking-wider">
                      الكلمات الأكثر بحثاً
                    </span>
                  </div>

                  <div className="relative w-full h-64 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60 overflow-hidden flex items-center justify-center select-none">
                    
                    {/* Term "الله" inside center */}
                    <span 
                      onClick={() => { setSearchQuery('الله'); setActiveTool('concordance'); }}
                      className="absolute text-5xl font-extrabold text-[#0e4e46] hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-4"
                    >
                      الله
                    </span>

                    {/* Term "محمد" written vertically on the left side of Center */}
                    <span 
                      onClick={() => { setSearchQuery('محمد'); setActiveTool('concordance'); }}
                      className="absolute text-4xl font-extrabold text-amber-800 hover:text-[#00a28a] transition-all cursor-pointer transform -translate-x-12 translate-y-2"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      محمد
                    </span>

                    {/* Term "سيارة" on the left */}
                    <span 
                      onClick={() => { setSearchQuery('سيارة'); setActiveTool('concordance'); }}
                      className="absolute text-3xl font-extrabold text-blue-500 hover:text-[#00a28a] transition-all cursor-pointer transform -translate-x-32 translate-y-6"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      سيارة
                    </span>

                    {/* Term "خالد" on the right */}
                    <span 
                      onClick={() => { setSearchQuery('خالد'); setActiveTool('concordance'); }}
                      className="absolute text-3xl font-bold text-neutral-800 hover:text-[#00a28a] transition-all cursor-pointer transform translate-x-14 translate-y-2"
                    >
                      خالد
                    </span>

                    {/* Term "كتاب" below center */}
                    <span 
                      onClick={() => { setSearchQuery('كتاب'); setActiveTool('concordance'); }}
                      className="absolute text-sm font-bold text-slate-600 hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-16 -translate-x-20"
                    >
                      كتاب
                    </span>

                    {/* Term "أبي" above center */}
                    <span 
                      onClick={() => { setSearchQuery('أبي'); setActiveTool('concordance'); }}
                      className="absolute text-sm font-bold text-[#0e4e46] hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-12 translate-x-8"
                    >
                      أبي
                    </span>

                    {/* Term "بسم" */}
                    <span 
                      onClick={() => { setSearchQuery('بسم'); setActiveTool('concordance'); }}
                      className="absolute text-xs font-bold text-red-600 hover:text-[#00a28a] transition-all cursor-pointer transform translate-y-14 -translate-x-28"
                    >
                      بسم
                    </span>

                    {/* Term "الحمد" */}
                    <span 
                      onClick={() => { setSearchQuery('الحمد'); setActiveTool('concordance'); }}
                      className="absolute text-xs font-semibold text-amber-600 hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-4 -translate-x-44"
                    >
                      الحمد
                    </span>

                    {/* Term "القرآن" */}
                    <span 
                      onClick={() => { setSearchQuery('القرآن'); setActiveTool('concordance'); }}
                      className="absolute text-xs font-bold text-[#00a28a] hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-14 translate-x-24"
                    >
                      القرآن
                    </span>

                    {/* Term "لسان" */}
                    <span 
                      onClick={() => { setSearchQuery('لسان'); setActiveTool('concordance'); }}
                      className="absolute text-xs font-semibold text-slate-400 hover:text-[#00a28a] transition-all cursor-pointer transform translate-y-10 translate-x-32"
                    >
                      لسان
                    </span>

                    {/* Term "صيحة" */}
                    <span 
                      onClick={() => { setSearchQuery('صيحة'); setActiveTool('concordance'); }}
                      className="absolute text-xs font-bold text-[#0e4e46] hover:text-[#00a28a] transition-all cursor-pointer transform translate-y-12 translate-x-6"
                    >
                      صيحة
                    </span>

                    {/* Term "أب" */}
                    <span 
                      className="absolute text-[10px] font-medium text-slate-400 transform -translate-y-8 translate-x-44"
                    >
                      أب
                    </span>

                    {/* Term "قل" */}
                    <span 
                      onClick={() => { setSearchQuery('قل'); setActiveTool('concordance'); }}
                      className="absolute text-[10px] font-bold text-indigo-500 hover:text-[#00a28a] transition-all cursor-pointer transform -translate-y-8 -translate-x-52"
                    >
                      قل
                    </span>

                    {/* Term "مال" */}
                    <span 
                      className="absolute text-[10px] font-medium text-slate-400 transform translate-y-4 -translate-x-48"
                    >
                      مال
                    </span>

                    {/* Term "خالد" (Vertical) */}
                    <span 
                      className="absolute text-xs font-semibold text-slate-400 transform translate-y-8 translate-x-40"
                      style={{ writingMode: 'vertical-rl' }}
                    >
                      بائس
                    </span>

                  </div>
                </div>

              </div>
            )}


            {/* Tool View 0: compos Tool (الكشاف السياقي) */}
            {activeTool === 'compos' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <QuranAudioSearchPage/>
              </div>
            )}

            {/* Tool View 2: Concordancer Tool (الكشاف السياقي) */}
            {activeTool === 'concordance' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0e4e46]">الكشاف السياقي (Concordancer)</h3>
                    <p className="text-xs text-slate-500 mt-1">البحث عن الكلمة في سياق الآيات القرآنية لمعرفة موضع ورودها الدقيق.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTool('home')}
                    className="text-xs font-bold text-slate-400 hover:text-[#0e4e46] flex items-center gap-1.5"
                  >
                    <span>رجوع للرئيسة</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>

                {/* Concordance core inputs */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-3.5 top-3.5 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="مثال: الله، الرحمن، الناس، الكتاب..."
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00a28a] focus:bg-white transition-all text-slate-800 font-bold"
                    />
                  </div>
                </div>

                {/* Results block */}
                <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex-1 flex flex-col">
                  <div className="p-4 bg-slate-100/50 border-b border-slate-200/50 flex justify-between items-center text-xs text-slate-500 font-bold">
                    <span>نتائج الكلمة: <strong className="text-[#00a28a]">"{searchQuery || "الكل"}"</strong></span>
                    <span>المواضع: <strong>{concordanceResults.length}</strong></span>
                  </div>

                  {concordanceResults.length > 0 ? (
                    <div className="divide-y divide-slate-100 overflow-y-auto max-h-[360px] flex-1">
                      {concordanceResults.map((v, index) => (
                        <div key={index} className="p-5 hover:bg-white transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <p className="quran-text text-right text-[#0e4e46] font-bold leading-normal flex-1">
                            {highlightWord(v.text, searchQuery)}
                          </p>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200/50 whitespace-nowrap self-end sm:self-auto">
                            <span>سورة {v.surah}</span>
                            <span>|</span>
                            <span>آية: {v.verseNo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
                      <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="font-bold text-sm">لم نجد نتائج مطابقة لبحثك في هذه النسخة التجريبية.</p>
                      <p className="text-xs">جرّب كتابة كلمات مقترحة مثل "الله" أو "الرحمن" أو "الناس".</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tool View 3: Word Frequency (قوائم الشيوع) */}
            {activeTool === 'frequency' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0e4e46]">قوائم الشيوع (Word Frequency)</h3>
                    <p className="text-xs text-slate-500 mt-1">عرض الكلمات الأكثر استخداماً وتكراراً في القرآن الكريم مصنفة مع نسبتها المئوية.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTool('home')}
                    className="text-xs font-bold text-slate-400 hover:text-[#0e4e46] flex items-center gap-1.5"
                  >
                    <span>رجوع</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الحد الأقصى للنتائج</label>
                    <select 
                      value={frequencyLimit} 
                      onChange={(e) => setFrequencyLimit(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                    >
                      <option value={10}>أكثر 10 كلمات شيوعاً</option>
                      <option value={20}>أكثر 20 كلمة شيوعاً</option>
                      <option value={40}>أكثر 40 كلمة شيوعاً</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input 
                      type="checkbox" 
                      id="stop-words" 
                      checked={showStopWords}
                      onChange={(e) => setShowStopWords(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" 
                    />
                    <label htmlFor="stop-words" className="text-xs font-bold text-slate-600 cursor-pointer">عرض الكلمات المستبعدة (Stop Words)</label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1">
                  <div className="overflow-y-auto max-h-[320px]">
                    <table className="w-full text-right text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 font-bold text-center">الترتيب</th>
                          <th className="px-6 py-3 font-bold">الكلمة</th>
                          <th className="px-6 py-3 text-center font-bold">عدد التكرار</th>
                          <th className="px-6 py-3 text-center font-bold">النسبة المئوية (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {wordFrequencyResults.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-3.5 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="px-6 py-3.5 font-bold text-[#0e4e46]">{item.word}</td>
                            <td className="px-6 py-3.5 text-center font-black text-slate-800">{item.count.toLocaleString()}</td>
                            <td className="px-6 py-3.5 text-center font-semibold text-teal-600">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tool View 4: Ngrams (التتابعات اللفظية) */}
            {activeTool === 'ngrams' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0e4e46]">التتابعات اللَّفظيَّة (N-grams)</h3>
                    <p className="text-xs text-slate-500 mt-1">دراسة التراكيب والجمل اللفظية المتتابعة المكونة من كلمتين أو أكثر في نصوص المدونة.</p>
                  </div>
                  <button onClick={() => setActiveTool('home')} className="text-xs font-bold text-slate-400 hover:text-[#0e4e46] flex items-center gap-1.5">
                    <span>رجوع</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 divide-y divide-slate-200/60 max-h-[380px] overflow-y-auto">
                  {NGrams_DATA.map((item, index) => (
                    <div key={index} className="py-3.5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-bold text-xs">{index + 1}</span>
                        <span className="font-extrabold text-[#0e4e46]">{item.phrase}</span>
                      </div>
                      <div className="flex gap-4 text-xs font-semibold text-slate-600">
                        <span>{item.count} مرة</span>
                        <span className="text-teal-600">{item.frequency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tool View 5: Collocations (التصاحب اللفظي) */}
            {activeTool === 'collocations' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0e4e46]">التصاحب اللفظي (Collocations)</h3>
                    <p className="text-xs text-slate-500 mt-1">يقيس مدى الترابط والتقارب اللفظي بين الكلمات المتجاورة حسب المؤشرات الإحصائية.</p>
                  </div>
                  <button onClick={() => setActiveTool('home')} className="text-xs font-bold text-slate-400 hover:text-[#0e4e46] flex items-center gap-1.5">
                    <span>رجوع</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <table className="w-full text-right text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-bold">الكلمة المصاحبة</th>
                        <th className="px-6 py-3 font-bold">موقع التواجد</th>
                        <th className="px-6 py-3 text-center font-bold">تكرار التصاحب</th>
                        <th className="px-6 py-3 text-center font-bold">LogDice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {COLLOCATIONS_DATA.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5 font-bold text-[#00a28a]">{item.collocate}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              item.position === 'يمين' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {item.position} الكلمة
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-center font-semibold">{item.count}</td>
                          <td className="px-6 py-3.5 text-center font-semibold text-[#0e4e46]">{item.logDice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tool View 6: Standard Statistics / List (الإحصائيات) */}
            {activeTool === 'statistics' && (
              <div className="lg:min-w-4xl space-y-6 animate-fadeIn flex-1 flex flex-col">
                <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0e4e46]">البيانات الإحصائية والتصنيفات</h3>
                    <p className="text-xs text-slate-500 mt-1">بيانات السور وتفاصيل تصنيفها المكي والمدني.</p>
                  </div>
                  <button onClick={() => setActiveTool('home')} className="text-xs font-bold text-slate-400 hover:text-[#0e4e46] flex items-center gap-1.5">
                    <span>رجوع</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>

                {/* Sura table with filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    {(['جميع', 'مكية', 'مدنية'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterSurahType(type)}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          filterSurahType === type 
                            ? 'bg-white text-[#0e4e46] shadow-sm' 
                            : 'text-slate-500 hover:text-slate-950'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="بحث عن سورة..."
                    value={surahSearch}
                    onChange={(e) => setSurahSearch(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#00a28a]"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1">
                  <div className="overflow-y-auto max-h-[280px]">
                    <table className="w-full text-right text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs border-b border-slate-100 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 font-bold">اسم السورة</th>
                          <th className="px-6 py-3 font-bold">التصنيف</th>
                          <th className="px-6 py-3 text-center font-bold">الآيات</th>
                          <th className="px-6 py-3 text-center font-bold">الكلمات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredSurahs.map((surah) => (
                          <tr key={surah.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-3 font-bold text-[#0e4e46]">{surah.name}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                surah.type === 'مكية' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'
                              }`}>
                                {surah.type}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center font-semibold">{surah.verses}</td>
                            <td className="px-6 py-3 text-center font-semibold">{surah.words.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tool View 7: AI Placeholder Fallback details */}
            {!['home', 'concordance', 'frequency', 'ngrams', 'collocations', 'statistics'].includes(activeTool) && (
              <div className="lg:min-w-4xl bg-slate-50/50 rounded-2xl p-8 border border-slate-100 text-center space-y-4 my-auto max-w-md mx-auto">
                <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600 border border-teal-100">
                  <Sparkles className="w-6 h-6 text-[#00a28a]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-800">
                    أداة {
                      activeTool === 'collocates' ? 'الكلمات السابقة واللاحقة' :
                      activeTool === 'affixes' ? 'السوابق واللواحق' :
                      activeTool === 'distribution' ? 'توزيع التكرار' :
                      activeTool === 'examples' ? 'البحث عن أمثلة' :
                      'استخلاص المصطلحات'
                    }
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    جاري إعداد محركات الحوسبة اللغوية المخصصة لهذه الأداة الفائقة بالاعتماد على مصفوفات مجمع الملك سلمان العالمي للغة العربية.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTool('home')}
                  className="text-xs font-bold text-white bg-[#00a28a] hover:bg-[#008f79] px-4 py-2 rounded-xl transition-all"
                >
                  الرجوع للواجهة الرئيسية
                </button>
              </div>
            )}

          </div>

          {}
          
        </div>
      </main>

      {}
      {/* 
        PREMIUM BRAND FOOTER (Curves and logo designs matching "منصة فلك - مدونة القرآن الكريم.jpg")
      */}
      <footer className="h-50 relative overflow-hidden mx-20">
        {/* <div className='bg-[url(/fotter-2.png)] bg-(image:w-fit) w-auto h-100'/> */}
       <Image src="/fotter-2.png" alt='' fill/>
      </footer>

      {/* DETAILED INFORMATION POPUP (MODAL) */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100 text-right">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-[#0e4e46]">تفاصيل مدونة القرآن الكريم</h3>
              </div>
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>الراوي والرواية:</strong> تم توثيق الآيات الكريمة وفقاً لمصادر رواية حفص عن عاصم بالرسم العثماني المعتمد من مجمع الملك فهد لطباعة المصحف الشريف.
              </p>
              <p>
                <strong>الهدف اللغوي:</strong> تمكين باحثي اللغويات وعلم معالجة اللغة الطبيعية (NLP) من رصد المفرادت وتواترها، وتحليل الصرف والنحو على نصوص مدونة الذكر الحكيم.
              </p>
              <div className="p-3 bg-teal-50 rounded-xl text-teal-800 font-bold flex items-center gap-2">
                <Check size={14} className="text-teal-600" />
                <span>الكلمات المشتقة والمجردة في المدونة: 77,439 كلمة</span>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full bg-[#00a28a] hover:bg-[#008f79] text-white py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}