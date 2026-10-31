# AI Career Assistant UI Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perbarui halaman AI Career Assistant agar sesuai dengan referensi UI dan mengurangi visual AI-slop, tanpa mengubah backend atau menambahkan dependency baru.

**Architecture:** Tampilan baru mengikuti struktur empat alur: beranda dua kartu utama (Analisis CV & Job Matching), hasil matching dengan skor ringkas dan progress bar, analisis skill gap terintegrasi dari hasil matching, serta CV analysis dengan skor utama dan kategori penilaian. Semua perubahan hanya pada komponen React di `resources/js/pages/app/ai-assistant/index.tsx`. Data tetap dikirim ke endpoint yang sudah ada; tidak ada skema API baru.

**Tech Stack:** Inertia.js + React 19 + TypeScript + Tailwind CSS + Lucide Icons

**Spec:** `docs/superpowers/specs/ReferenceUI/1 AI Career Assistant.png`, `docs/superpowers/specs/ReferenceUI/2 Analisis CV.png`, `docs/superpowers/specs/ReferenceUI/3 AI jOB MATCHING.png`, `docs/superpowers/specs/ReferenceUI/4 skill gap.png`

## Global Constraints

- Backend: tetap pakai endpoint `/app/ai/match/{vacancy}`, `/app/ai/skill-gap`, `/app/ai/cv-review`; response schema dari `AiProviderInterface` dipertahankan.
- Warna Profabel: gunakan putih, biru muda `#B8D6E5`, navy `#123B5D`, cyan `#20B8C1`, hijau emerald untuk hasil positif.
- No AI slop: hindari gradien berat, logo "Powered by Gemini", badge berlebih, angka dekoratif, atau layout tiga kartu hero.
- Accessibility: setiap tombol memiliki label aksesibel; fokus state menggunakan ring cyan; contrast cukup tinggi.
- Build: `npm run build` harus sukses tanpa error TS/CSS.
- Test: setiap perubahan tampilan disertai test render minimal untuk memastikan komposisi tetap valid.
- Nama path: semua file di atas root project C:\!project\project_WE\AKSARA.

## Review Focus

- Input kosong/invalid pada form (cvText pendek, skill string kosong): tampilkan pesan empty state, tidak memicu crash.
- Hasil AI field null/missing: tampilkan fallback aman, jangan menampilkan undefined atau NaN.
- Loading state saat menunggu respons: show spinner/disabled button, bukan ghost skeleton.
- Match percentage/negative value: clamp ke 0–100 untuk progress bar; jangan menampilkan -10%.
- Aksesibilitas focus indicator: pastikan ring cyan terlihat jelas di light/dark mode.

---

### Task 1: Beranda AI — Hero Sederhana dengan Dua Kartu Fitur

**Files:**

- Modify: `resources/js/pages/app/ai-assistant/index.tsx:180-235`
- Test: N/A (component-level visual change verified via build)

**Interfaces:**

- Consumes: `activeTab` state; `savedMatches` and `activeVacancies` props remain unchanged.
- Produces: new hero section with two feature cards (CV Analysis, Job Matching); removes "powered by" label and dark gradient.

- [ ] **Step 1: Write the failing test structure**

We can't write a unit test that validates visual design directly. Instead, we'll add a minimal snapshot-style assertion in an integration test later to ensure the component renders without errors after changes. For now, confirm manually via dev server and screenshot.

- [ ] **Step 2: Run current app to verify baseline**

Run: `npm run dev` and navigate to `/app/ai-assistant`. Note the current hero (dark gradient, "Powered by Gemini") and tab navigation.

- [ ] **Step 3: Replace hero and tabs with two-card layout**

In `resources/js/pages/app/ai-assistant/index.tsx`, starting at line ~183:

- Remove dark gradient hero and "AI Powered" badges.
- Add white background hero with simple heading: "AI Career Assistant".
- Below it, a short descriptive sentence: "Teman cerdas untuk perjalanan karirmu."
- Add two large cards side-by-side on desktop, stacked on mobile:
    - Card A: "AI CV Analysis" with purple accent, description bullet points, and "Mulai Analisis CV →" button.
    - Card B: "AI Job Matching" with blue accent, description bullet points, and "Mulai Job Matching →" button.
- Update button handlers to set `activeTab='cvReview'` and `activeTab='matches'` respectively.

Example code block for card layout:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
    <button
        type="button"
        onClick={() => setActiveTab('cvReview')}
        className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm text-left hover:border-purple-300 transition min-h-[280px] flex flex-col justify-between"
    >
        <div>
            <span className="inline-flex items-center justify-center rounded-xl bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800 mb-3">
                Persiapkan lamaran terbaik
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
                AI CV Analysis
            </h3>
            <p className="mt-2 text-xs text-slate-600">
                AI membantu menganalisis CV kamu dan memberikan saran untuk
                meningkatkan kesesuaian dengan lowongan pekerjaan.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-700 list-disc list-inside">
                <li>Analisis kesesuaian dengan job description</li>
                <li>Rekomendasi perbaikan CV</li>
                <li>Tips penulisan yang lebih efektif</li>
            </ul>
        </div>
        <div className="mt-4 text-sm font-semibold text-purple-700 flex items-center gap-1">
            Mulai Analisis CV <ArrowRight className="h-4 w-4" />
        </div>
    </button>
    <button
        type="button"
        onClick={() => setActiveTab('matches')}
        className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm text-left hover:border-blue-300 transition min-h-[280px] flex flex-col justify-between"
    >
        <div>
            <span className="inline-flex items-center justify-center rounded-xl bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 mb-3">
                Temukan pekerjaan yang tepat
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
                AI Job Matching
            </h3>
            <p className="mt-2 text-xs text-slate-600">
                AI membantu mencocokkan profilmu dengan lowongan pekerjaan
                berdasarkan kompetensi, pengalaman, preferensi kerja, dan
                kebutuhan aksesibilitas.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-700 list-disc list-inside">
                <li>Rekomendasi lowongan personal</li>
                <li>Pertimbangan kebutuhan aksesibilitas</li>
                <li>Tingkat kesesuaian profil</li>
            </ul>
        </div>
        <div className="mt-4 text-sm font-semibold text-blue-700 flex items-center gap-1">
            Mulai Job Matching <ArrowRight className="h-4 w-4" />
        </div>
    </button>
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`. Expected: PASS with no TS/CSS errors.

Manual check: Open `/app/ai-assistant` and verify hero is clean white, two cards visible, no "Gemini" branding.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/app/ai-assistant/index.tsx
git commit -m "feat: redesign AI career assistant home with two-card layout"
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### Task 2: AI Job Matching — Select Dropdown dengan Kartu Lowongan

**Files:**

- Modify: `resources/js/pages/app/ai-assistant/index.tsx:238-365`
- Test: Verify match result shows skills, experience, project, accessibility scores when available from backend; otherwise fallback gracefully.

**Interfaces:**

- Consumes: `currentMatch` object from `/app/ai/match/{vacancy}`; fields: `match_percentage`, `competency_score`, `accessibility_score`, `matching_points`, `gaps`, `summary`.
- Produces: redesigned match result section with score ring, four-category bars, matching chips, gap cards.

- [ ] **Step 1: Write the failing test structure**

Add a test case in `tests/Feature/AiAssistantUITest.php` that ensures the page renders without crashing when loaded with sample data. This is a regression guard, not a visual design test.

- [ ] **Step 2: Run test to verify it fails**

Expected: The test will fail if the new components reference missing props or invalid JSX structure.

- [ ] **Step 3: Implement redesigned match results**

At line ~269, after match execution:

- Replace current simple EMerald card with a structured layout:
    - Top row: vacancy title, company name, location, work model, plus main score circle (green ring).
    - Four-category mini-bars underneath: Skill, Experience, Project, Accessibility. Each uses a progress bar style with icon + label + percentage.
    - Chips area for matching skills/tags ("Yang Sesuai").
    - Two cards for Alasaan Kecocokan (reasons) and Gap.
- If `competency_score` or other values are missing from backend response, display "—" instead of showing undefined.
- Use consistent colors: green for positive, amber/orange for neutral warnings, slate for info.
- Button: "Lihat Detail Lowongan" linking to `/jobs/{slug}` and "Lihat Analisis Skill Gap" (future redirect placeholder).

Code block snippet for category bars:

```tsx
{
    currentMatch && (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">
                        {currentMatch.vacancy?.title || 'Lowongan'}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {currentMatch.vacancy?.company_profile?.company_name ||
                            ''}{' '}
                        • {currentMatch.vacancy?.location || ''} •{' '}
                        {currentMatch.vacancy?.work_model || ''}
                    </p>
                </div>
                <div className="relative inline-flex items-center justify-center">
                    <svg
                        className="h-20 w-20 transform -rotate-90"
                        viewBox="0 0 36 36"
                    >
                        <circle
                            className="stroke-slate-200 stroke-3 fill-none"
                            cx="18"
                            cy="18"
                            r="16"
                        />
                        <circle
                            className={`stroke-emerald-500 stroke-3 transition-all duration-500 ease-out ${currentMatch.match_percentage > 80 ? 'animate-spin-slow' : ''}`}
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            strokeDasharray={`${currentMatch.match_percentage}, 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute text-base font-black text-slate-900">
                        {currentMatch.match_percentage}%
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <CategoryBar
                    label="Skill"
                    value={currentMatch.competency_score ?? 0}
                    color="blue"
                />
                <CategoryBar
                    label="Pengalaman"
                    value={currentMatch.experience_score ?? 0}
                    color="indigo"
                />
                <CategoryBar
                    label="Proyek"
                    value={currentMatch.project_score ?? 0}
                    color="violet"
                />
                <CategoryBar
                    label="Aksesibilitas"
                    value={currentMatch.accessibility_score ?? 0}
                    color="emerald"
                />
            </div>
        </>
    );
}
```

Create helper `CategoryBar` component locally inside same file:

```tsx
const CategoryBar = ({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) => (
    <div className="rounded-xl bg-white p-3 border border-slate-200">
        <span className="block text-xs font-medium text-slate-600 mb-1">
            {label}
        </span>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
                className={`h-full bg-${color}-500`}
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
        <span className="block text-xs font-bold text-slate-900 mt-1">
            {value}%
        </span>
    </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`. Expected: PASS. Manual: Check that score ring and progress bars render correctly, especially when value is outside 0–100 (clamp).

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/app/ai-assistant/index.tsx
git commit -m "feat: redesign AI job matching results with rings and category bars"
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### Task 3: CV Analysis — Skor Utama, Penilaian Kategori, Kekuatan & Area Perbaikan

**Files:**

- Modify: `resources/js/pages/app/ai-assistant/index.tsx:459-545`
- Test: Ensure ATS score clamped at 0–100; improvements/strengths arrays rendered safely even if empty.

**Interfaces:**

- Consumes: `cvResult` object from `/app/ai/cv-review`: `ats_score`, `formatting_grade`, `strengths`, `improvements`, `accessibility_tips`.
- Produces: redesigned CV review page with circular score, per-category bar chart, keyword suggestions, action recommendations.

- [ ] **Step 1: Write the failing test structure**

Same as before: minimal integration test for rendering.

- [ ] **Step 2: Run test to verify it fails**

Expected: Component may break if new JSX references nonexistent keys like `experience_score` which don't exist in `reviewCvAts` schema.

- [ ] **Step 3: Implement redesigned CV analysis**

Replace existing CV review layout with:

- Right sidebar: circular score (ATS score out of 100), status message (e.g., "CV kamu sudah baik!"), quick tips.
- Main left content: three sections tabbed horizontally: Ringkasan, ATS & Struktur CV, Konten.
- Ringkasan includes "Kekuatan Utama" (3 cards), "Area yang Perlu Ditingkatkan" (3 cards).
- Sidebar also shows "Kata Kunci yang Disarankan" (pill tags), "Rekomendasi Tindak Lanjut" (numbered list).
- Fallback: if `ats_score` is missing, show "—" with a gentle note.
- Colors: green ring for score ≥80, yellow 60–79, red <60.
- Use consistent border radius 2xl, white backgrounds, subtle borders.

Code snippet for circular score:

```tsx
<div className="right-sidebar">
    <div className="flex items-center justify-center">
        <svg className="h-24 w-24 transform -rotate-90">
            <circle
                className="stroke-slate-200 stroke-3 fill-none"
                cx="48"
                cy="48"
                r="42"
            />
            <circle
                className={`stroke-emerald-500 stroke-3`}
                cx="48"
                cy="48"
                r="42"
                fill="none"
                strokeDasharray={`${Math.max(0, cvResult.ats_score ?? 0)}, 100`}
            />
        </svg>
    </div>
    <div className="text-center font-black text-2xl text-slate-900 mt-2">
        {cvResult.ats_score ?? '—'}%
    </div>
    <div className="mt-1 text-xs text-slate-500">Skor CV Kamu</div>
</div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/app/ai-assistant/index.tsx
git commit -m "feat: redesign CV analysis with circular score and sidebar recommendations"
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### Task 4: Skill Gap — Integrasi dari Hasil Matching, Tab Terpadu, Rekomendasi Pembelajaran

**Files:**

- Create: `resources/js/components/skill-gap-panel.tsx`
- Modify: `resources/js/pages/app/ai-assistant/index.tsx:367-456`, plus link from Task 2's "Lihat Analisis Skill Gap" button.
- Test: Validate skill gap result renders matched/missing skills cleanly; learning recommendations shown clearly.

**Interfaces:**

- Consumes: `gapResult` object from `/app/ai/skill-gap`: `match_score`, `matched_skills`, `missing_skills`, `learning_recommendations`.
- Produces: panel component with two-column layout: main area shows strengths/weaknesses with progress bars; sidebar shows keywords missed and development steps.

- [ ] **Step 1: Write the failing test structure**

Add test ensuring `skill-gap-panel.tsx` renders without errors given sample data.

- [ ] **Step 2: Run test to verify it fails**

Expected: Component will error if expected fields are not present.

- [ ] **Step 3: Implement skill gap panel**

New file `resources/js/components/skill-gap-panel.tsx`:

- Header with back button to return to matching results.
- Left column: main analysis summary with four progress bars (Keterampilan, Pengalaman, Proyek, Aksesibilitas — map to backend fields where available).
- Three numbered sections: 1) Kekuatan Utama, 2) Area Perbaikan, 3) Kesesuaian Pengalaman.
- Right sidebar: Summary Overview, Missing Keywords (tag pills), Development Recommendations (numbered step list).
- Buttons: "Lihat Detail Lowongan" and "Simpan Analisis Skill Gap".
- Use consistent Profabel palette; avoid excessive badges.
- Fallback: if backend doesn't return certain categories, hide them.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run build`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add resources/js/components/skill-gap-panel.tsx resources/js/pages/app/ai-assistant/index.tsx
git commit -m "feat: create skill gap panel integrated from job matching flow"
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### Task 5: Polish & Empty States — Consistent Typography, Loading States, Error Handling

**Files:**

- Modify: all modified files from Tasks 1–4
- Test: Confirm loading spinners appear during async actions; empty states show friendly messages.

**Interfaces:**

- Consumes: existing loading flags (`isMatching`, `isAnalyzingGap`, `isScanningCv`).
- Produces: consistent UI polish across all screens.

- [ ] **Step 1: Add loading states**

Ensure each async operation shows:

- Disabled button with text "Menganalisis...".
- Optional simple spinner SVG or Lucide icon while waiting.
- Do not show skeleton until more detail required.

- [ ] **Step 2: Add empty states**

When no saved matches or active vacancies, show centered message: "Belum ada riwayat pencocokan tersimpan. Gunakan dropdown di atas untuk memulai."

- [ ] **Step 3: Style consistency pass**

Check all headings use `font-extrabold` consistently, buttons have min-h-44, borders and spacing match reference.

- [ ] **Step 4: Run build and verify**

Run: `npm run build`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add resources/js/**/*.tsx
git commit -m "chore: polish AI career assistant with consistent typography and loading states"
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-30-aksara-ai-career-assistant-ui-improvements.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven** – A fresh subagent implements each task and a fresh reviewer checks it before the next one starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native** – I implement every task myself in this session, the way this harness runs work, then one fresh reviewer on the most capable model checks the whole branch. Cheapest and fastest; no independent review until the end. Runs well with a mid-tier session model, since the plan carries the design.

**For this plan I recommend Native**, because tasks depend on consistent interfaces (same file edits propagate cleanly), there are five tightly related UI refinements, and shipping a wrong button placement is low-cost. Does the plan capture what you want, and which approach should we use?
