# Quranic Recitation Search Engine (Youg for Quran)

A Next.js-based web application designed to help users learn the correct pronunciation, articulation, and recitation of Quranic words and verses. Modeled conceptually after platforms like Youg, this tool allows users to search for specific words or navigate by Chapter (Surah) and Verse (Ayah) to see and hear them recited in real-time via synchronized YouTube video embeds.

## 🚀 Overview

Correct pronunciation (*Tajweed*) and precise articulation of vowels (*Tashkeel*) are fundamental to Quranic recitation. This project acts as an interactive search engine and learning companion. For this initial demo version, the application operates using a single comprehensive YouTube video URL containing multi-hour recitations, mapped precisely with granular timestamps down to individual words and verses.

---

## ✨ Key Features

### 1. Dual-Input Navigation System
*   **Structural Selection:** Users can browse directly by choosing a **Surah (Chapter)** and a specific **Ayah (Verse)** number from intuitive dropdown menus.
*   **Lexical Word Search:** Users can type a search term in Arabic. The engine dynamically matches the query against an index of Quranic vocabulary.

### 2. Tashkeel-Aware Precision Matching
*   **Fuzzy & Exact Matching:** When typing an Arabic word without diacritics, the engine suggests closely matching words populated with full **Tashkeel** (vowelization marks like Fatha, Damma, Kasra, Sukun, Shadda).
*   **Contextual Verse Listing:** Selecting a specific Tashkeel variant instantly updates the UI with a complete list of all Ayahs across the Quran where that exact word form appears.

### 3. Synchronized YouTube Embedded Player
*   **Conditional Rendering:** The YouTube video player remains hidden or in a placeholder state until a specific Ayah is explicitly selected.
*   **Precise Time-Cueing:** Upon Ayah selection, the player mounts and automatically cues (`seekTo`) to the exact millisecond/second where that specific verse begins in the video recitation.

### 4. Contextual Side Panel
*   **Tafseer Window:** Displays authentic exegesis (Tafseer) of the currently selected Ayah to provide vital linguistic, historical, and theological context.
*   **Recitation & Tajweed Guide:** Provides clear instructions on how to articulate ("sight") the selected Ayah, highlighting specific Tajweed rules (e.g., *Idgham*, *Ikhfa*, *Ghunnah*) present in that phrase.

---

## 🛠️ Tech Stack

quran-recitation-search/
├── public/
│   └── assets/                  # Images, icons, or local fonts
├── src/
│   ├── app/                     # Next.js App Router folders
│   │   ├── layout.tsx           # Global layout (providers, fonts, metadata)
│   │   ├── page.tsx             # Main dashboard page (Search engine + Player view)
│   │   └── globals.css          # Tailwind CSS global styles
│   ├── components/              # Reusable UI components
│   │   ├── SearchSection.tsx    # Text search input & Surah/Ayah dropdowns
│   │   ├── TashkeelSelector.tsx # List of vowelized options for selected words
│   │   ├── VersesList.tsx       # Matching ayahs displayed after selecting a word
│   │   ├── VideoPlayer.tsx      # Embedded YouTube player container (handles seekTo)
│   │   └── SidePanel.tsx        # Tafseer & Tajweed visual guides
│   ├── data/                    # Local static JSON files or mock databases
│   │   ├── words-index.json     # Word tokens mapped to Surah/Ayah occurrences
│   │   └── verses-data.json     # Full text, timestamps, Tafseer, and Tajweed guides
│   ├── hooks/                   # Custom React hooks
│   │   └── useYoutubePlayer.ts  # Handles communication with the YouTube Player API
│   └── utils/                   # Helper functions
│       └── arabicHelpers.ts     # Strips Tashkeel for fuzzy matching / filters text
├── package.json
├── tailwind.config.ts
└── tsconfig.json

*   **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/) - Utilizing Server Components for fast initial page loads and Client Components for interactive player state management.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - For a clean, fully responsive, and accessible user interface.
*   **Video Integration:** [YouTube Player API (via `react-youtube`)](https://www.npmjs.com/package/react-youtube) - Allows programmatic control over playback, buffering state, and exact timestamp skipping.
*   **State Management:** React Context API or Zustand - To manage selected Surah, Ayah, active timestamp, and search configurations across the interface.

---

## 📐 Data Structure & Mock Schema

To drive the demo, the application uses a structured data model linking text, diacritics, timestamps, and metadata.

### 1. Word Index Schema
```json
{
  "word_id": "w1023",
  "root_letters": "ق-و-ل",
  "text_clean": "قالوا",
  "text_tashkeel": "قَالُوا۟",
  "occurrences": [
    { "surah": 2, "ayah": 30 },
    { "surah": 2, "ayah": 32 }
  ]
}
```

### 2. Verse & Video Timestamp Schema
```json
{
  "surah_number": 2,
  "ayah_number": 30,
  "text_arabic": "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً...",
  "tafseer": "Remember when your Lord said to the angels, 'Indeed, I will make upon the earth a successive authority'...",
  "recitation_guide": "Pay close attention to the elongation (Madd) on 'لِلْمَلَائِكَةِ' and the nasalization (Ghunnah) on 'إِنِّي'.",
  "video_mapping": {
    "youtube_url": "https://www.youtube.com/watch?v=EXAMPLE_ID",
    "start_time_seconds": 1245,
    "end_time_seconds": 1312
  }
}
```

---

## 🔄 Application Flow & User Journey

```
               [ User Input ]
                      |
        +-------------+-------------+
        |                           |
 [ Select Surah/Ayah ]      [ Search Arabic Word ]
        |                           |
        |                  [ Filter Tashkeel Variants ]
        |                           |
        |                  [ Select Targeted Word ]
        |                           |
        |                  [ Display Matching Ayahs ]
        |                           |
        +------------->+------------+
                       |
            [ Explicit Ayah Selection ]
                       |
                       v
        +--------------+--------------+
        |                             |
        v                             v
[ Mount/Update YouTube Player ]  [ Populate Side Panel ]
- Seek to `start_time_seconds`   - Load Tafseer Text
- Auto-play recitation block     - Highlight Tajweed rules
```

---

## ⚙️ Installation & Setup

Follow these steps to set up and run the project locally.

### Prerequisites
*   Node.js (v18.x or higher)
*   npm, yarn, pnpm, or bun

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/quran-recitation-search.git
cd quran-recitation-search
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

---

## 🗺️ Future Roadmap

While this MVP operates on a single YouTube video file to validate the search mechanics and user interface, future scaling phases will include:
1.  **Multi-Reciter Engine:** Allowing users to switch between different world-renowned reciters (e.g., Mishary Alafasy, Shaimaa Khalil, Abdul Basit) for the same word.
2.  **Crowdsourced Crowdbased Timestamping:** Building an ingestion pipeline where users can submit or refine word-level and verse-level YouTube video timestamps.
3.  **Audio Analysis Integration:** Incorporating microphone input for real-time comparison between user recitation and the video audio to score pronunciation accuracy.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## [\u0621-\u064A]+ Arabic 
## Arabic diacritics: [\u064B-\u0652\u0670]