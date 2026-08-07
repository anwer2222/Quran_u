export interface GrammarExample {
    id: string;
    surahName: string;
    surah: number;
    ayahNumber: number;
    text: string;
    ayah: string;
    highlighted: number[]; // 0-based word indexes for highlighted syntactic structure
  }
  
  export interface GrammarRuleRecord {
    id: string;
    bab: string;         // Level 1: الباب
    majal: string;       // Level 2: المجال
    muqaddam: string;    // Level 3: المقدم
    muakhar: string;     // Level 4: المؤخر
    title: string;
    grammaticalRule: string;
    quranicExamples: GrammarExample[];
  }
  
  // 4-Level Category Taxonomy Hierarchy
  export const GRAMMAR_TAXONOMY: Record<string, Record<string, Record<string, string[]>>> = {
    "باب المبتدأ والخبر": {
      "خبر > مبتدأ": {
        "اسم استفهام": ["اسم ظاهر", "ضمير منفصل"],
        "اسم ظاهر": ["اسم استفهام", "اسم ظاهر", "اسم موصول", "ضمير منفصل"],
        "جار ومجرور": ["اسم استفهام", "اسم شرط", "اسم ظاهر", "اسم موصول"],
        "ظرف": ["اسم ظاهر", "اسم موصول"],
      },
      "مبتدأ > جملة فعلية واقعة خبرًا": {
        "اسم استفهام": ["جملة فعلية"],
        "اسم شرط": ["جملة فعلية"],
        "اسم ظاهر": ["جملة فعلية"],
        "اسم موصول": ["جملة فعلية"],
        "ضمير منفصل": ["جملة فعلية"],
      },
    },
    "باب المفعول به": {
      
      "مفعول به > فعل": {
        "اسم استفهام": ["فعل"],
        "اسم شرط": ["فعل"],
        "اسم ظاهر": ["فعل"],
        "اسم موصول": ["فعل"],
        "ضمير منفصل": ["فعل"],
      },
      "مفعول به > فاعل": {
        "اسم ظاهر": ["اسم ظاهر", "اسم موصول"],
        "اسم موصول": ["اسم ظاهر"],
        "ضمير متصل": ["اسم ظاهر", "اسم موصول"],
        "ضمير منفصل": ["مصدر مؤول"],
      },
      "مفعول به موصول > فاعل": {
        "اسم موصول": ["اسم ظاهر"],
      },
      "مفعول به موصول > فعل": {
        "اسم موصول": ["فعل"],
      },
    },
    "باب المتعلقات والظروف": {
      "جار ومجرور > خبر كان": {
        "جار ومجرور": ["اسم ظاهر"],
      },
      "جار ومجرور > فاعل": {
        "جار ومجرور": ["اسم ظاهر", "اسم موصول", "مصدر مؤول"],
      },
      "جار ومجرور > مفعول به": {
        "جار ومجرور": ["اسم ظاهر", "اسم موصول"],
      },
      "جار ومجرور > مفعول به أو ظرف": {
        "جار ومجرور": ["اسم ظاهر"],
      },
      "جار ومجرور > نائب فاعل": {
        "جار ومجرور": ["اسم ظاهر", "اسم موصول"],
      },
      "جار ومجرور قائم مقام المفعول به > فاعل": {
        "جار ومجرور": ["اسم ظاهر"],
      },
      "شبه جملة > مفعول به": {
        "جار ومجرور": ["اسم ظاهر"],
      },
      "ظرف > العامل المتعلَّق به": {
        "ظرف": ["اسم ظاهر"],
      },
      "ظرف > فاعل": {
        "ظرف": ["اسم ظاهر"],
      },
      "ظرف > مفعول به": {
        "ظرف": ["اسم ظاهر"],
      },
      "متعلّق (جار ومجرور أو ظرف) > العامل المتعلَّق به": {
        "جار ومجرور": ["اسم ظاهر", "ظرف", "فعل"],
      },
    },
    "باب الشرط": {
      "متعلقات الفعل > نائب فاعل": {
        "تركيب متعدد العناصر": ["اسم ظاهر"],
      },
      "جواب الشرط > جملة الشرط": {
        "جملة جواب الشرط": ["جملة شرطية"],
      },
      "شبه جملة وجملة شرط > نائب فاعل": {
        "تركيب مركب": ["اسم ظاهر"],
      },
      "متعلّق شرطي > الشرط أو جوابه": {
        "اسم شرط": ["جملة جواب الشرط"],
      },
    },
    
    
    "باب الاشتغال": {
      "اسم مرفوع مشغول عنه > فعل مفسر": {
        "اسم ظاهر": ["فعل"],
      },
      "مفعول به مشغول عنه > فعل مفسر": {
        "اسم ظاهر": ["فعل"],
      },
    },
    "باب النواسخ": {
      "أنَّ": {
        "اسم ظاهر": ["اسم ظاهر"],
        "جار ومجرور": ["اسم موصول"],
      },
      "إنَّ": {
        "اسم ظاهر": ["اسم ظاهر"],
        "جار ومجرور": ["اسم ظاهر", "اسم موصول"],
        "ظرف": ["اسم ظاهر", "اسم موصول"],
      },
      "كان وأخواتها": { // : خبر الناسخ > اسم الناسخ
        "اسم ظاهر": ["اسم ظاهر"],
        "ضمير متصل": ["مصدر مؤول"],
        "جار ومجرور": ["اسم ظاهر"],
        "ظرف": ["اسم ظاهر"],
      },

    },
  };
  
  // Demo records mapped directly to the grammar tree
  export const GRAMMAR_MOCK_DATA: GrammarRuleRecord[] = [
    {
      id: "GRM001",
      bab: "باب المبتدأ والخبر",
      majal: "خبر > مبتدأ",
      muqaddam: "جار ومجرور",
      muakhar: "اسم ظاهر",
      title: "تقدم الخبر (جار ومجرور) على المبتدأ (اسم ظاهر)",
      grammaticalRule: "تقديم الخبر الوجوبي/الجوازي عند كون الخبر شبه جملة والمبتدأ نكرة أو معرفة.",
      quranicExamples: [
        { id: "G001", surahName: "الفاتحة", surah: 1, ayahNumber: 2, ayah: "الْحَمْدُ لِلَّهِ", text:"الْحَمْدُ",highlighted: [0, 1] },
        { id: "G002", surahName: "البقرة", surah: 2, ayahNumber: 10, ayah: "فِي قُلُوبِهِم مَّرَضٌ", text: "قُلُوبِهِم", highlighted: [0, 1, 2] },
      ],
    },
    {
      id: "GRM002",
      bab: "باب المفعول به",
      majal: "مفعول به > فعل",
      muqaddam: "ضمير منفصل",
      muakhar: "فعل",
      title: "تقدم المفعول به الضمير المنفصل على الفعل ليفيد الحصر والاختصاص",
      grammaticalRule: "تقدم ضمير النصب المنفصل (إياك) على فعله لإفادة القصر والتخصيص.",
      quranicExamples: [
        { id: "G003", surahName: "الفاتحة", surah: 1, ayahNumber: 5, text:"وَإِيَّاكَ",ayah: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", highlighted: [0, 1] },
      ],
    },
  ];

/**
 * Helper to compute 0-based word indexes of targetedWord inside ayahText
 */
function getHighlightedIndexes(ayahText: string, targetedWord: string): number[] {
  if (!ayahText || !targetedWord) return [];

  const textWords = ayahText.trim().split(/\s+/);
  const targetWords = targetedWord.trim().split(/ \| /);
  const indexes: number[] = [];

  // Find where targetedWord tokens appear sequentially or individually in ayahText
  for (let i = 0; i < textWords.length; i++) {
    // Check for exact word match or substring match ignoring diacritics/punctuation
    const cleanTextWord = textWords[i].replace(/[^\u0600-\u06FF]/g, "");
    
    for (const target of targetWords) {
      const cleanTarget = target.replace(/[^\u0600-\u06FF]/g, "");
      if (cleanTextWord && cleanTarget && cleanTextWord.includes(cleanTarget)) {
        indexes.push(i);
        break;
      }
    }
  }

  return indexes;
}

/**
 * Parses the 8-column Grammar CSV file:
 * <1st level cat>,<2nd cat>,<3rd cat>,<4th cat>,<surahNumber>,<ayahNumber>,<ayahText>,<targetedWord>
 */
export function parseGrammarCsv(csvContent: string): GrammarRuleRecord[] {
  const lines = csvContent.replace(/\r\n/g, "\n").split("\n");
  const recordsMap: Record<string, GrammarRuleRecord> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split CSV fields safely
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));

    if (parts.length >= 8) {
      const [cat1, cat2, cat3, cat4, surahNumber, ayahNumber, ayahText, t1,t2, surahStr, tp, ref] = parts;

      const surahNum = parseInt(surahNumber, 10) || 1;
      const ayahNum = parseInt(ayahNumber, 10) || 1;

      // Group key based on the 4-level taxonomy path
      const ruleKey = `${cat1}|${cat2}|${cat3}|${cat4}`;

      const targetedWord = t1 + " | "+ t2

      // Calculate highlighted word indexes dynamically
      const highlighted = getHighlightedIndexes(ayahText, targetedWord);

      const example: GrammarExample = {
        id: `HZM_${i + 1}`,
        surahName: `سورة ${surahStr}`, // Surah name can be mapped or resolved dynamically
        surah: surahNum,
        ayahNumber: ayahNum , //===2?31:ayahNum===31?2:ayahNum,
        ayah: ayahText,
        text: t1+ " - "+ t2+", "+ref,
        highlighted,
      };

      if (!recordsMap[ruleKey]) {
        recordsMap[ruleKey] = {
          id: `HP_${Object.keys(recordsMap).length + 1}`,
          title: `${cat2.split(" > ")[0]} [${cat3}] > ${cat2.split(" > ")[1]} [${cat4}]`,
          // phoneticEnv: `${cat3} -> ${cat4}`,
          // hamzaCount: 1,
          bab: cat1,
          majal: cat2,
          muqaddam: cat3,
          muakhar: cat4,
          // recitersRules: "حسب القراءة والطريق المعتمد",
          // approvedOperations: "التحقيق / التسهيل / الإبدال / الإسقاط",
          grammaticalRule: ref,
          // categoryPath: [cat1, cat2, cat3, cat4],
          quranicExamples: [example],
        };
      } else {
        recordsMap[ruleKey].quranicExamples.push(example);
      }
    }
  }

  return Object.values(recordsMap);
}