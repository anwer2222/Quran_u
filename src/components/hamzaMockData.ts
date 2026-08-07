export interface HamzaExample {
  id: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
  ayah: string;
  highlighted: number[];
}

export interface HamzaRuleRecord {
  id: string;
  title: string;
  phoneticEnv: string;
  hamzaCount: number;
  scope: string;
  context: string;
  recitersRules: string;
  approvedOperations: string;
  quranicExamples: HamzaExample[];
  reference: string;
  // Category path hierarchy: Level 1 -> Level 2 -> Level 3 -> Level 4
  categoryPath: [string, string, string?, string?];
}

// Full 4-level Category Taxonomy Tree
export const HAMZA_TAXONOMY: Record<string, Record<string, Record<string, string[]>>> = {
  "الهمزتان": {
    "في كلمة واحدة": {
      // "الاستفهامان":["مفتوحة + مكسورة"],
      "الهمزة الداخلة على ألف اللام": ["مفتوحة + مفتوحة"],
      "متماثلتان": ["مفتوحة + مفتوحة"],
      "مختلفتان": ["مفتوحة + مكسورة","مفتوحة + مضمومة", "همزة مضمومة + همزة ساكنة", ],
    },
    "في كلمتين": {
      "متماثلتان": ["مكسورة + مكسورة", "مفتوحة + مفتوحة", "مضمومة + مضمومة"],
      "مختلفتان":["مفتوحة + مكسورة", "مفتوحة + مضمومة", "مضمومة + مفتوحة", "مضمومة + مكسورة", "مكسورة + مفتوحة"],
    },
  },
  "الهمزة المفردة": {
    "الساكنة": {
      "أصل": ["فتحة سابقة + همزة ساكنة","ضمة سابقة + همزة ساكنة", "همزة مضمومة + همزة ساكنة"],
      "سكون البناء": ["كسرة سابقة + همزة ساكنة", "فتحة سابقة + همزة ساكنة"],
      "سكون الجزم": [
        "فتحة سابقة + همزة ساكنة",
        "ضمة سابقة + همزة ساكنة",
        "كسرة سابقة + همزة ساكنة",
      ],
      "الهمزة الساكنة بعد همزة الوصل": ["همزة وصل مكسورة + همزة أصلية ساكنة"],
      "بعد واو الجماعة": ["واو الجماعة + همزة ساكنة"]
      
    },
    "المتحركة": {
      "مختلفة": [
        "ساكن + همزة مضمومة",
        "ساكن + همزة مفتوحة",
        "ساكن + همزة مكسورة",
        "ضمة سابقة + همزة مكسورة",
        "ضمة سابقة + همزة مفتوحة",
        "فتحة سابقة + همزة مضمومة",
        "فتحة سابقة + همزة مكسورة",
        "كسرة سابقة + همزة مفتوحة",
        "كسرة سابقة + همزة مضمومة",
        "كسرة سابقة + همزة مضمومة + واو الجماعة",
      ],
      "متماثلة": [
        "ضمة سابقة + همزة مضمومة",
        "فتحة سابقة + همزة مفتوحة",
        "كسرة سابقة + همزة مكسورة",
      ],
      "مد": [
        "مد + همزة مضمومة",
        "مد + همزة مكسورة",
        "مد + همزة مفتوحة",
        "همزة مفتوحة + مد",
      ],

      "بعد واو الجماعة": [
        "واو الجماعة + همزة مفتوحة",
        "واو الجماعة + همزة مكسورة",
      ],
      "ميم الجمع": [
        "ميم جمع + همزة وصل",
        "ميم جمع + همزة مكسورة",
        "ميم جمع + همزة مفتوحة",
        "ميم جمع + همزة مضمومة",
      ],
      "تنوين": [
        "تنوين ضم + همزة مفتوحة",
        "تنوين فتح + همزة مفتوحة",
        "تنوين كسر + همزة مكسورة",
      ],
      "ياء لين":["ياء لين ساكنة + همزة قطع مفتوحة"],
      "صوت مشدد": ["همزة مضمومة + صوت مشدد"],
      "هاء السكت": ["هاء سكت + همزة مكسورة"],
      // "همزتان":["همزتان مفتوحتان في كلمة واحدة"]
    },
  },
};

export const HAMZA_MOCK_DATA: HamzaRuleRecord[] = [
  {
    id: "HP023",
    title: "همزتان في كلمة - مختلفتان",
    phoneticEnv: "الموطن: بداية الكلمة | الحركات: مفتوحة + مكسورة",
    hamzaCount: 2,
    scope: "في كلمة",
    context: "الوصل والابتداء",
    recitersRules: "نافع وأبو جعفر: الأول خبر والثاني استفهام | الباقون: استفهامان",
    approvedOperations: "الخبر أو الاستفهام بحسب القراءة؛ وعند الاستفهام يجري أصل التحقيق أو التسهيل والفصل",
    reference: "ابن الجزري، النشر في القراءات العشر، ص 370–378",
    categoryPath: ["الهمزتان","في كلمة واحدة", "مختلفتان","مفتوحة + مكسورة",],
    quranicExamples: [
      { id: "H068", surahName: "النمل", surahNumber: 27, ayahNumber: 67, text: "أَئِذَا | أَئِنَّا", ayah: "وَقَالَ ٱلَّذِينَ كَفَرُوٓاْ أَءِذَا كُنَّا تُرَٰبٗا وَءَابَآؤُنَآ أَئِنَّا لَمُخۡرَجُونَ",highlighted: [3,7] },
      // { id: "H069", surahName: "النمل", surah: "27", ayahNumber: 67, text: "أَئِنَّا",ayah: "وَقَالَ ٱلَّذِينَ كَفَرُوٓاْ أَءِذَا كُنَّا تُرَٰبٗا وَءَابَآؤُنَآ أَئِنَّا لَمُخۡرَجُونَ", highlighted: [7] },
    ],
  },
  {
    id: "HP030",
    title: "همزتان مكسورتان في كلمتين",
    phoneticEnv: "الموطن: آخر الكلمة الأولى + أول الكلمة الثانية | الحركات: مكسورة + مكسورة",
    hamzaCount: 2,
    scope: "في كلمتين",
    context: "الوصل فقط؛ يزول الاجتماع بالوقف",
    recitersRules: "عاصم وابن عامر وحمزة والكسائي وروح على التحقيق؛ أبو عمرو على إسقاط الأولى...",
    approvedOperations: "تحقيقهما؛ إسقاط الأولى؛ تسهيل الأولى؛ تحقيق الأولى وتسهيل الثانية...",
    reference: "ابن الجزري، النشر في القراءات العشر، ص 370–378",
    categoryPath: ["الهمزتان","في كلمتين", "متماثلتان", "مكسورة + مكسورة",],
    quranicExamples: [
      { id: "H086", surahName: "البقرة", surahNumber: 2, ayahNumber: 31, text: "هَٰؤُلَاءِ | إِنْ", ayah:"وَعَلَّمَ ءَادَمَ ٱلۡأَسۡمَآءَ كُلَّهَا ثُمَّ عَرَضَهُمۡ عَلَى ٱلۡمَلَٰٓئِكَةِ فَقَالَ أَنۢبِـُٔونِي بِأَسۡمَآءِ هَٰٓؤُلَآءِ إِن كُنتُمۡ صَٰدِقِينَ", highlighted:[11,12] },
      { id: "H092", surahName: "النور", surahNumber: 24, ayahNumber: 33, text: "الْبِغَاءِ | إِنْ", ayah:" وَلَا تُكۡرِهُواْ فَتَيَٰتِكُمۡ عَلَى ٱلۡبِغَآءِ إِنۡ أَرَدۡنَ تَحَصُّنٗا لِّتَبۡتَغُواْ عَرَضَ ٱلۡحَيَوٰةِ ٱلدُّنۡيَاۚ وَمَن يُكۡرِههُّنَّ فَإِنَّ ٱللَّهَ مِنۢ بَعۡدِ إِكۡرَٰهِهِنَّ غَفُورٞ رَّحِيمٞ",highlighted:[5,6] },
    ],
  },
];

/**
 * Helper to compute 0-based word indexes of targetedWord inside ayahText
 */

function getHighlightedIndexes(ayahText: string, targetedWord: string): number[] {
  if (!ayahText || !targetedWord) return [];

  const textWords = ayahText.trim().split(/\s+/);
  const cleanTarget = targetedWord.trim();
  const indexes: number[] = [];

  // If the target contains a space, it's a multi-word sequence phrase
  if (cleanTarget.includes(" ")) {
    const targetTokens = cleanTarget.split(/\s+/).map((t) => t.replace(/[^\u0600-\u06FF]/g, ""));
    
    for (let i = 0; i <= textWords.length - targetTokens.length; i++) {
      let matched = true;
      for (let j = 0; j < targetTokens.length; j++) {
        const cleanTextWord = textWords[i + j].replace(/[^\u0600-\u06FF]/g, "");
        if (!cleanTextWord || cleanTextWord !== targetTokens[j]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        // Highlight all consecutive word indexes belonging to this sequence phrase
        for (let j = 0; j < targetTokens.length; j++) {
          indexes.push(i + j);
        }
        break; // Stop after finding the first sequence match
      }
    }
  } else {
    // Single word matching
    const cleanTargetWord = cleanTarget.replace(/[^\u0600-\u06FF]/g, "");
    for (let i = 0; i < textWords.length; i++) {
      const cleanTextWord = textWords[i].replace(/[^\u0600-\u06FF]/g, "");
      if (cleanTextWord && cleanTargetWord && cleanTextWord.includes(cleanTargetWord)) {
        indexes.push(i);
      }
    }
  }

  return indexes;
}



/**
 * Parses the 8-column Hamza CSV file:
 * <1st level cat>,<2nd cat>,<3rd cat>,<4th cat>,<surahNumber>,<ayahNumber>,<ayahText>,<targetedWord>
 */
export function parseHamzaCsv(csvContent: string): HamzaRuleRecord[] {
  const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
  const recordsMap: Record<string, HamzaRuleRecord> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split CSV fields safely
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));

    if (parts.length >= 8) {
      const [cat1, cat2, cat3, cat4, surahStr, ayahStr, ayahText, targetedWord] = parts;

      const surahNum = parseInt(surahStr, 10) || 1;
      const ayahNum = parseInt(ayahStr, 10) || 1;

      // Group key based on the 4-level taxonomy path
      const ruleKey = `${cat1}|${cat2}|${cat3}|${cat4}`;

      // Calculate highlighted word indexes dynamically
      const highlighted = getHighlightedIndexes(ayahText, targetedWord);

      const example: HamzaExample = {
        id: `HZM_${i + 1}`,
        surahName: `سورة ${surahNum}`, // Surah name can be mapped or resolved dynamically
        surahNumber: surahNum,
        ayahNumber: ayahNum , //===2?31:ayahNum===31?2:ayahNum,
        ayah: ayahText,
        text: targetedWord,
        highlighted,
      };

      if (!recordsMap[ruleKey]) {
        recordsMap[ruleKey] = {
          id: `HP_${Object.keys(recordsMap).length + 1}`,
          title: `${cat1} - ${cat2} (${cat3} / ${cat4})`,
          phoneticEnv: `${cat3} -> ${cat4}`,
          hamzaCount: 1,
          scope: cat2,
          context: cat3,
          recitersRules: "حسب القراءة والطريق المعتمد",
          approvedOperations: "التحقيق / التسهيل / الإبدال / الإسقاط",
          reference: "ابن الجزري، النشر في القراءات العشر",
          categoryPath: [cat1, cat2, cat3, cat4],
          quranicExamples: [example],
        };
      } else {
        recordsMap[ruleKey].quranicExamples.push(example);
      }
    }
  }

  return Object.values(recordsMap);
}