export interface HamzaExample {
  id: string;
  surahName: string;
  ayahNumber: number;
  text: string;
  surah: string;
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
      "همزة الاستفهام مع همزة الوصل": [],
      "متحركتان": ["فتح + فتح", "فتح + كسر", "فتح + ضم"],
      "الثانية ساكنة": ["بعد فتح", "بعد ضم", "بعد كسر"],
      "الاستفهامان": [],
    },
    "في كلمتين": {
      "متفقتان": ["فتح", "كسر", "ضم"],
      "مختلفتان": ["فتح + كسر", "فتح + ضم", "كسر + فتح", "ضم + فتح", "ضم + كسر"],
    },
  },
  "الهمزة المفردة": {
    "ساكنة": {
      "الموقع": ["فاء", "عين", "لام", "بعد همزة وصل"],
    },
    "متحركة": {
      "الموقع": ["فاء", "عين", "لام"],
    },
  },
  "الوقف على الهمز": {
    "متطرفة": {
      "نوع ما قبلها": ["بعد متحرك", "صحيح ساكن", "ياء أصلية", "واو أصلية", "أليف", "حرف مد زائد"],
    },
    "متوسطة ساكنة": {
      "النوع": ["ساكنة مطلقاً"],
    },
    "متوسطة متحركة": {
      "نوع ما قبلها": ["بعد ساكن", "بعد ألف", "بعد متحرك"],
    },
  },
};

export const HAMZA_MOCK_DATA: HamzaRuleRecord[] = [
  {
    id: "HP023",
    title: "همزتان في كلمة",
    phoneticEnv: "الموطن: بداية الكلمة | الحركات: مفتوحة + مكسورة",
    hamzaCount: 2,
    scope: "في كلمة",
    context: "الوصل والابتداء",
    recitersRules: "نافع وأبو جعفر: الأول خبر والثاني استفهام | الباقون: استفهامان",
    approvedOperations: "الخبر أو الاستفهام بحسب القراءة؛ وعند الاستفهام يجري أصل التحقيق أو التسهيل والفصل",
    reference: "ابن الجزري، النشر في القراءات العشر، ص 370–378",
    categoryPath: ["الهمزتان", "في كلمة واحدة", "الاستفهامان", "الهدف الأول"],
    quranicExamples: [
      { id: "H068", surahName: "النمل", surah: "27", ayahNumber: 67, text: "أَئِذَا | أَئِنَّا", ayah: "وَقَالَ ٱلَّذِينَ كَفَرُوٓاْ أَءِذَا كُنَّا تُرَٰبٗا وَءَابَآؤُنَآ أَئِنَّا لَمُخۡرَجُونَ",highlighted: [3,7] },
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
    categoryPath: ["الهمزتان", "في كلمتين", "متفقتان", "كسر"],
    quranicExamples: [
      { id: "H086", surahName: "البقرة", surah: "2", ayahNumber: 31, text: "هَٰؤُلَاءِ | إِنْ", ayah:"وَعَلَّمَ ءَادَمَ ٱلۡأَسۡمَآءَ كُلَّهَا ثُمَّ عَرَضَهُمۡ عَلَى ٱلۡمَلَٰٓئِكَةِ فَقَالَ أَنۢبِـُٔونِي بِأَسۡمَآءِ هَٰٓؤُلَآءِ إِن كُنتُمۡ صَٰدِقِينَ", highlighted:[11,12] },
      { id: "H092", surahName: "النور", surah: "24", ayahNumber: 33, text: "الْبِغَاءِ | إِنْ", ayah:" وَلَا تُكۡرِهُواْ فَتَيَٰتِكُمۡ عَلَى ٱلۡبِغَآءِ إِنۡ أَرَدۡنَ تَحَصُّنٗا لِّتَبۡتَغُواْ عَرَضَ ٱلۡحَيَوٰةِ ٱلدُّنۡيَاۚ وَمَن يُكۡرِههُّنَّ فَإِنَّ ٱللَّهَ مِنۢ بَعۡدِ إِكۡرَٰهِهِنَّ غَفُورٞ رَّحِيمٞ",highlighted:[5,6] },
    ],
  },
];