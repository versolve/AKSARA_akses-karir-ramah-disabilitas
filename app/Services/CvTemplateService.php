<?php

namespace App\Services;

use App\Models\JobSeekerProfile;

class CvTemplateService
{
    public const TEMPLATE_CLASSIC = 'classic';
    public const TEMPLATE_MODERN = 'modern';
    public const TEMPLATE_EXECUTIVE = 'executive';
    public const TEMPLATE_COMPACT = 'compact';

    public static function getTemplateList(): array
    {
        return [
            [
                'id' => self::TEMPLATE_CLASSIC,
                'name' => '01 Classic (Harvard Style)',
                'tagline' => 'Tradisional, Formal & Netral',
                'target_industry' => 'Hukum, Keuangan, Akuntansi, Konsultan, Perbankan, BUMN, Pemerintahan, Akademik',
                'font_family' => 'Times New Roman / Georgia (Serif)',
                'header_layout' => 'Rata Tengah (Center-aligned)',
                'divider_style' => 'Garis Solid Tipis (1 pt)',
                'accent_color' => '#000000',
                'accent_color_secondary' => '#333333',
                'badge' => 'Serif • Harvard',
            ],
            [
                'id' => self::TEMPLATE_MODERN,
                'name' => '02 Modern Minimalist',
                'tagline' => 'Bersih, Ringan & Kontemporer',
                'target_industry' => 'Startup, Teknologi/IT, Produk Digital, Pemasaran, Desain, Bisnis Umum',
                'font_family' => 'Calibri / Arial (Sans-serif)',
                'header_layout' => 'Rata Kiri (Left-aligned, 3 baris)',
                'divider_style' => 'Garis Halus (#CBD5E1) + Spacing Lega',
                'accent_color' => '#0F4C81',
                'accent_color_secondary' => '#4B5563',
                'badge' => 'Sans-Serif • Navy',
            ],
            [
                'id' => self::TEMPLATE_EXECUTIVE,
                'name' => '03 Executive Formal',
                'tagline' => 'Tegas dengan Hierarki Visual Kuat',
                'target_industry' => 'Mid-to-Senior, Manajerial, Perbankan Korporat, BUMN, Manufaktur, Operasional',
                'font_family' => 'Cambria / Trebuchet MS (Serif/Humanist)',
                'header_layout' => 'Rata Kiri + Garis Aksen Tebal Penutup',
                'divider_style' => 'Arsiran Latar Judul (#F3F4F6) + Garis Bawah Aksen (#1B365D)',
                'accent_color' => '#1B365D',
                'accent_color_secondary' => '#F3F4F6',
                'badge' => 'Shaded • Deep Navy',
            ],
            [
                'id' => self::TEMPLATE_COMPACT,
                'name' => '04 Compact Clean',
                'tagline' => 'Padat 1 Halaman Rapi & Terstruktur',
                'target_industry' => 'Software Engineer, Peneliti, Fresh Graduate, Tenaga Teknis dengan banyak proyek',
                'font_family' => 'Calibri / Arial (Sans-serif ringkas)',
                'header_layout' => 'Rata Kiri Ringkas (Maksimal 2 baris)',
                'divider_style' => 'Garis Tipis 0.5 pt (#9CA3AF)',
                'accent_color' => '#2D3748',
                'accent_color_secondary' => '#555555',
                'badge' => 'Compact • 1 Halaman',
            ],
        ];
    }

    public static function getSampleData(): array
    {
        return [
            'name' => 'BUDI SANTOSO',
            'job_title' => 'Frontend Web & Accessibility Specialist',
            'email' => 'budi.santoso@email.com',
            'phone' => '+62 812-3456-7890',
            'domicile' => 'Jakarta Selatan, Indonesia',
            'linkedin' => 'linkedin.com/in/budisantoso',
            'portfolio' => 'budisantoso.dev',
            'summary' => 'Profesional pengembang web dengan pengalaman lebih dari 3 tahun dalam membangun antarmuka web interaktif, berkinerja tinggi, dan ramah aksesibilitas (WCAG 2.1 AA). Terbiasa berkolaborasi dengan tim lintas disiplin untuk menghasilkan solusi digital yang inklusif, terukur, dan berdampak nyata bagi ribuan pengguna aktif bulanan.',
            'experiences' => [
                [
                    'position' => 'Senior Frontend Developer',
                    'company' => 'PT Teknologi Inklusi Nusantara',
                    'location' => 'Jakarta (Hybrid)',
                    'period' => 'Jan 2024 - Sekarang',
                    'achievements' => [
                        'Memimpin re-arsitektur antarmuka web dengan React dan TypeScript, meningkatkan kecepatan muat halaman sebesar 38%.',
                        'Menerapkan standar aksesibilitas WCAG 2.1 AA di seluruh portal karier, meningkatkan kepuasan pengguna penyandang disabilitas hingga 94%.',
                        'Mengurangi error pemindaian CV ATS dengan merancang alur dokumen terstruktur yang memproses lebih dari 10.000 pelamar per bulan.',
                    ],
                ],
                [
                    'position' => 'Frontend Web Developer',
                    'company' => 'PT Solusi Digital Bersama',
                    'location' => 'Bandung (Remote)',
                    'period' => 'Agu 2022 - Des 2023',
                    'achievements' => [
                        'Mengembangkan lebih dari 15 modul dashboard interaktif dengan Tailwind CSS dan Inertia.js untuk klien enterprise.',
                        'Mengoptimalkan ukuran bundel JavaScript sebesar 45% melalui code-splitting dan tree-shaking efisien.',
                        'Berkolaborasi aktif dengan tim QA dan Backend untuk merancang RESTful API contracts yang konsisten.',
                    ],
                ],
            ],
            'educations' => [
                [
                    'degree' => 'Sarjana Komputer (S.Kom) - Teknik Informatika',
                    'institution' => 'Universitas Indonesia',
                    'location' => 'Depok, Jawa Barat',
                    'period' => '2018 - 2022',
                    'notes' => 'IPK: 3.82 / 4.00 (Cum Laude). Fokus Tugas Akhir: Desain Antarmuka Inklusif untuk Pembaca Layar.',
                ],
            ],
            'skills' => [
                'Teknis' => ['React.js', 'TypeScript', 'JavaScript (ES6+)', 'Tailwind CSS', 'HTML5 & CSS3 Semantic', 'Inertia.js', 'RESTful API', 'Git & CI/CD'],
                'Aksesibilitas & Standar' => ['WCAG 2.1 AA', 'Screen Reader Optimization (NVDA/JAWS)', 'WAI-ARIA', 'Semantic Document Structure', 'ATS Optimization'],
                'Soft Skills' => ['Problem Solving', 'Komunikasi Empatik', 'Kerja Sama Tim Lintas Fungsi', 'Manajemen Waktu Terstruktur'],
            ],
            'projects' => [
                [
                    'name' => 'Profabel Career Portal',
                    'period' => '2024',
                    'description' => 'Platform rekrutmen tenaga kerja ramah disabilitas pertama dengan fitur AI Job Matching dan ATS CV Reviewer real-time.',
                ],
                [
                    'name' => 'Accessible Design System Library',
                    'period' => '2023',
                    'description' => 'Komponen UI open-source dengan kepatuhan kontras 5:1 dan dukungan navigasi keyboard penuh.',
                ],
            ],
            'certifications' => [
                [
                    'name' => 'Certified Professional in Accessibility Core Competencies (CPACC)',
                    'issuer' => 'IAAP',
                    'period' => '2024',
                ],
                [
                    'name' => 'Google Cloud Associate Cloud Engineer',
                    'issuer' => 'Google',
                    'period' => '2023',
                ],
            ],
        ];
    }

    public static function buildUserData(JobSeekerProfile $seeker): array
    {
        $user = $seeker->user;
        $sample = self::getSampleData();

        $name = strtoupper(trim((string) ($user?->name ?: 'Pencari Kerja')));
        $jobTitle = $seeker->current_job_title ?: ($sample['job_title']);
        $email = $user?->email ?: $sample['email'];
        $phone = $seeker->phone ?: $sample['phone'];
        $domicile = $seeker->domicile ?: $sample['domicile'];
        $linkedin = $seeker->linkedin_url ?: $sample['linkedin'];
        $portfolio = $seeker->portfolio_url ?: $sample['portfolio'];
        $summary = $seeker->bio ?: $sample['summary'];

        // Format Experiences
        $experiences = [];
        $rawExp = $seeker->work_experiences;
        if (is_array($rawExp) && count($rawExp) > 0) {
            foreach ($rawExp as $exp) {
                if (! is_array($exp)) {
                    continue;
                }
                $achievements = [];
                if (! empty($exp['description'])) {
                    $lines = preg_split('/[\r\n]+/', (string) $exp['description']);
                    foreach ($lines as $line) {
                        $trimmed = trim(ltrim(trim($line), "-•* \t"));
                        if (strlen($trimmed) > 3) {
                            $achievements[] = $trimmed;
                        }
                    }
                }
                if (empty($achievements)) {
                    $achievements = ['Melaksanakan tanggung jawab posisi dengan standar kualitas tinggi dan terukur.'];
                }

                $start = $exp['start_date'] ?? '';
                $end = ! empty($exp['end_date']) ? $exp['end_date'] : 'Sekarang';
                $period = ($start || $end) ? trim("{$start} - {$end}") : '';

                $experiences[] = [
                    'position' => $exp['position'] ?? 'Staf Profesional',
                    'company' => $exp['company'] ?? 'Perusahaan',
                    'location' => $exp['location'] ?? '',
                    'period' => $period ?: 'Periode Kerja',
                    'achievements' => $achievements,
                ];
            }
        }
        if (empty($experiences)) {
            $experiences = $sample['experiences'];
        }

        // Format Educations
        $educations = [];
        $rawEdu = $seeker->educations;
        if (is_array($rawEdu) && count($rawEdu) > 0) {
            foreach ($rawEdu as $edu) {
                if (! is_array($edu)) {
                    continue;
                }
                $start = $edu['start_year'] ?? '';
                $end = $edu['end_year'] ?? '';
                $period = ($start || $end) ? trim("{$start} - {$end}") : '';

                $educations[] = [
                    'degree' => $edu['degree'] ?? 'Pendidikan Formal',
                    'institution' => $edu['institution'] ?? 'Institusi Pendidikan',
                    'location' => $edu['location'] ?? '',
                    'period' => $period ?: 'Tahun',
                    'notes' => '',
                ];
            }
        } elseif (! empty($seeker->education)) {
            $educations[] = [
                'degree' => $seeker->education,
                'institution' => 'Institusi Pendidikan Terdaftar',
                'location' => $domicile,
                'period' => 'Lulus',
                'notes' => '',
            ];
        } else {
            $educations = $sample['educations'];
        }

        // Format Skills
        $skills = [];
        $rawSkills = $seeker->skills;
        if (is_array($rawSkills) && count($rawSkills) > 0) {
            $stringSkills = array_values(array_filter($rawSkills, fn ($s) => is_string($s) && strlen(trim($s)) > 0));
            if (! empty($stringSkills)) {
                $skills['Keahlian Utama'] = $stringSkills;
            }
        }
        if (empty($skills)) {
            $skills = $sample['skills'];
        }

        // Format Projects
        $projects = [];
        $rawProjects = $seeker->projects;
        if (is_array($rawProjects) && count($rawProjects) > 0) {
            foreach ($rawProjects as $p) {
                if (! is_array($p) || empty($p['name'])) {
                    continue;
                }
                $projects[] = [
                    'name' => $p['name'],
                    'period' => '',
                    'description' => $p['description'] ?? '',
                ];
            }
        }
        if (empty($projects)) {
            $projects = $sample['projects'];
        }

        // Format Certifications
        $certifications = [];
        $rawCerts = $seeker->certifications;
        if (is_array($rawCerts) && count($rawCerts) > 0) {
            foreach ($rawCerts as $c) {
                if (! is_array($c) || empty($c['name'])) {
                    continue;
                }
                $certifications[] = [
                    'name' => $c['name'],
                    'issuer' => $c['issuer'] ?? '',
                    'period' => (string) ($c['year'] ?? ''),
                ];
            }
        }
        if (empty($certifications)) {
            $certifications = $sample['certifications'];
        }

        return [
            'name' => $name,
            'job_title' => $jobTitle,
            'email' => $email,
            'phone' => $phone,
            'domicile' => $domicile,
            'linkedin' => $linkedin,
            'portfolio' => $portfolio,
            'summary' => $summary,
            'experiences' => $experiences,
            'educations' => $educations,
            'skills' => $skills,
            'projects' => $projects,
            'certifications' => $certifications,
        ];
    }

    /**
     * Menghasilkan dokumen Word (.doc) berstandar ISO HTML & XML Office
     * yang dapat langsung dibuka, diedit, dan dicetak oleh Microsoft Word, Google Docs, dan WPS Office.
     */
    public static function generateWordDocument(string $template, array $data): string
    {
        $template = in_array($template, [self::TEMPLATE_CLASSIC, self::TEMPLATE_MODERN, self::TEMPLATE_EXECUTIVE, self::TEMPLATE_COMPACT], true)
            ? $template
            : self::TEMPLATE_CLASSIC;

        $css = self::getCssForTemplate($template);
        $headerHtml = self::renderHeaderHtml($template, $data);
        $summaryHtml = self::renderSummaryHtml($template, $data);
        $experienceHtml = self::renderExperienceHtml($template, $data);
        $educationHtml = self::renderEducationHtml($template, $data);
        $skillsHtml = self::renderSkillsHtml($template, $data);
        $projectsHtml = self::renderProjectsHtml($template, $data);
        $certificationsHtml = self::renderCertificationsHtml($template, $data);

        return <<<HTML
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
{$css}
</style>
</head>
<body>
<div class="Section1">
  {$headerHtml}
  {$summaryHtml}
  {$experienceHtml}
  {$educationHtml}
  {$skillsHtml}
  {$projectsHtml}
  {$certificationsHtml}
</div>
</body>
</html>
HTML;
    }

    private static function getCssForTemplate(string $template): string
    {
        return match ($template) {
            self::TEMPLATE_CLASSIC => <<<CSS
@page Section1 {
    size: 21.0cm 29.7cm;
    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    mso-header-margin: 0cm;
    mso-footer-margin: 0cm;
    mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
    font-family: 'Times New Roman', Georgia, serif;
    font-size: 10.5pt;
    line-height: 1.15;
    color: #000000;
    background-color: #FFFFFF;
}
h1.cv-name {
    font-size: 17pt;
    font-weight: bold;
    text-transform: uppercase;
    text-align: center;
    margin: 0 0 4pt 0;
    color: #000000;
}
.cv-contact {
    font-size: 10pt;
    text-align: center;
    color: #333333;
    margin: 0 0 12pt 0;
}
h2.cv-section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
    border-bottom: 1pt solid #000000;
    padding-bottom: 2pt;
    margin: 12pt 0 4pt 0;
}
.entry-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2pt;
}
.entry-table td {
    padding: 0;
    vertical-align: top;
}
.entry-title {
    font-weight: bold;
    font-size: 10.5pt;
    color: #000000;
}
.entry-subtitle {
    font-size: 10pt;
    color: #333333;
}
.entry-date {
    text-align: right;
    font-size: 10pt;
    color: #333333;
    white-space: nowrap;
}
ul.cv-bullet-list {
    margin: 2pt 0 6pt 16pt;
    padding: 0;
    list-style-type: disc;
}
ul.cv-bullet-list li {
    font-size: 10.5pt;
    line-height: 1.15;
    margin-bottom: 2pt;
    color: #000000;
}
p.cv-paragraph {
    margin: 0 0 6pt 0;
    font-size: 10.5pt;
    line-height: 1.15;
    text-align: justify;
}
CSS,

            self::TEMPLATE_MODERN => <<<CSS
@page Section1 {
    size: 21.0cm 29.7cm;
    margin: 1.9cm 1.9cm 1.9cm 1.9cm;
    mso-header-margin: 0cm;
    mso-footer-margin: 0cm;
    mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
    font-family: Calibri, Arial, 'Segoe UI', sans-serif;
    font-size: 10pt;
    line-height: 1.2;
    color: #1F2937;
    background-color: #FFFFFF;
}
h1.cv-name {
    font-size: 19pt;
    font-weight: bold;
    color: #0F4C81;
    text-align: left;
    margin: 0 0 2pt 0;
}
.cv-job-title {
    font-size: 11pt;
    color: #4B5563;
    margin: 0 0 3pt 0;
}
.cv-contact {
    font-size: 9.5pt;
    color: #4B5563;
    margin: 0 0 14pt 0;
}
h2.cv-section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    color: #0F4C81;
    border-bottom: 1pt solid #CBD5E1;
    padding-bottom: 3pt;
    margin: 14pt 0 5pt 0;
}
.entry-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2pt;
}
.entry-table td {
    padding: 0;
    vertical-align: top;
}
.entry-title {
    font-weight: bold;
    font-size: 10.5pt;
    color: #1F2937;
}
.entry-subtitle {
    font-size: 9.5pt;
    color: #4B5563;
}
.entry-date {
    text-align: right;
    font-size: 9.5pt;
    color: #4B5563;
    white-space: nowrap;
}
ul.cv-bullet-list {
    margin: 2pt 0 6pt 16pt;
    padding: 0;
    list-style-type: disc;
}
ul.cv-bullet-list li {
    font-size: 10pt;
    line-height: 1.2;
    margin-bottom: 3pt;
    color: #1F2937;
}
p.cv-paragraph {
    margin: 0 0 6pt 0;
    font-size: 10pt;
    line-height: 1.2;
    text-align: left;
}
CSS,

            self::TEMPLATE_EXECUTIVE => <<<CSS
@page Section1 {
    size: 21.0cm 29.7cm;
    margin: 2.0cm 2.0cm 2.0cm 2.0cm;
    mso-header-margin: 0cm;
    mso-footer-margin: 0cm;
    mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
    font-family: Cambria, 'Trebuchet MS', Georgia, serif;
    font-size: 10.5pt;
    line-height: 1.15;
    color: #111827;
    background-color: #FFFFFF;
}
h1.cv-name {
    font-size: 18pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #1B365D;
    text-align: left;
    margin: 0 0 2pt 0;
}
.cv-job-title {
    font-size: 11pt;
    color: #4B5563;
    margin: 0 0 3pt 0;
}
.cv-contact {
    font-size: 10pt;
    color: #4B5563;
    margin: 0 0 6pt 0;
}
.cv-header-divider {
    border-bottom: 2pt solid #1B365D;
    margin-bottom: 12pt;
}
h2.cv-section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #1B365D;
    background-color: #F3F4F6;
    border-bottom: 1.5pt solid #1B365D;
    padding: 3pt 6pt;
    margin: 14pt 0 5pt 0;
}
.entry-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2pt;
}
.entry-table td {
    padding: 0;
    vertical-align: top;
}
.entry-title {
    font-weight: bold;
    font-size: 10.5pt;
    color: #111827;
}
.entry-subtitle {
    font-size: 10pt;
    color: #4B5563;
}
.entry-date {
    text-align: right;
    font-size: 10pt;
    color: #4B5563;
    white-space: nowrap;
}
ul.cv-bullet-list {
    margin: 2pt 0 6pt 16pt;
    padding: 0;
    list-style-type: disc;
}
ul.cv-bullet-list li {
    font-size: 10.5pt;
    line-height: 1.15;
    margin-bottom: 2pt;
    color: #111827;
}
p.cv-paragraph {
    margin: 0 0 6pt 0;
    font-size: 10.5pt;
    line-height: 1.15;
    text-align: justify;
}
CSS,

            self::TEMPLATE_COMPACT => <<<CSS
@page Section1 {
    size: 21.0cm 29.7cm;
    margin: 1.3cm 1.3cm 1.3cm 1.3cm;
    mso-header-margin: 0cm;
    mso-footer-margin: 0cm;
    mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
    font-family: Calibri, Arial, 'Segoe UI', sans-serif;
    font-size: 9.5pt;
    line-height: 1.1;
    color: #111111;
    background-color: #FFFFFF;
}
h1.cv-name {
    font-size: 15.5pt;
    font-weight: bold;
    color: #111111;
    text-align: left;
    margin: 0 0 2pt 0;
}
.cv-contact {
    font-size: 9pt;
    color: #555555;
    margin: 0 0 8pt 0;
}
h2.cv-section-title {
    font-size: 10.5pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #2D3748;
    border-bottom: 0.5pt solid #9CA3AF;
    padding-bottom: 2pt;
    margin: 10pt 0 3pt 0;
}
.entry-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1pt;
}
.entry-table td {
    padding: 0;
    vertical-align: top;
}
.entry-title {
    font-weight: bold;
    font-size: 10pt;
    color: #111111;
}
.entry-subtitle {
    font-size: 9pt;
    color: #555555;
}
.entry-date {
    text-align: right;
    font-size: 9pt;
    color: #555555;
    white-space: nowrap;
}
ul.cv-bullet-list {
    margin: 1pt 0 4pt 14pt;
    padding: 0;
    list-style-type: disc;
}
ul.cv-bullet-list li {
    font-size: 9.5pt;
    line-height: 1.1;
    margin-bottom: 1.5pt;
    color: #111111;
}
p.cv-paragraph {
    margin: 0 0 4pt 0;
    font-size: 9.5pt;
    line-height: 1.1;
    text-align: justify;
}
CSS,
        };
    }

    private static function renderHeaderHtml(string $template, array $data): string
    {
        $name = htmlspecialchars($data['name']);
        $jobTitle = htmlspecialchars($data['job_title'] ?? '');
        $email = htmlspecialchars($data['email']);
        $phone = htmlspecialchars($data['phone']);
        $domicile = htmlspecialchars($data['domicile']);
        $linkedin = htmlspecialchars($data['linkedin']);
        $portfolio = htmlspecialchars($data['portfolio'] ?? '');

        if ($template === self::TEMPLATE_CLASSIC) {
            $contacts = array_filter([$domicile, $email, $phone, $linkedin, $portfolio]);
            $contactLine = implode(' | ', $contacts);
            return <<<HTML
<h1 class="cv-name">{$name}</h1>
<div class="cv-contact">{$contactLine}</div>
HTML;
        }

        if ($template === self::TEMPLATE_MODERN) {
            $contacts = array_filter([$domicile, $email, $phone, $linkedin, $portfolio]);
            $contactLine = implode(' &bull; ', $contacts);
            $roleLine = $jobTitle ? "<div class=\"cv-job-title\">{$jobTitle}</div>" : '';
            return <<<HTML
<h1 class="cv-name">{$name}</h1>
{$roleLine}
<div class="cv-contact">{$contactLine}</div>
HTML;
        }

        if ($template === self::TEMPLATE_EXECUTIVE) {
            $contacts = array_filter([$domicile, $email, $phone, $linkedin, $portfolio]);
            $contactLine = implode(' | ', $contacts);
            $roleLine = $jobTitle ? "<div class=\"cv-job-title\">{$jobTitle}</div>" : '';
            return <<<HTML
<h1 class="cv-name">{$name}</h1>
{$roleLine}
<div class="cv-contact">{$contactLine}</div>
<div class="cv-header-divider"></div>
HTML;
        }

        // Compact Clean
        $titleSuffix = $jobTitle ? " &mdash; {$jobTitle}" : '';
        $contacts = array_filter([$domicile, $email, $phone, $linkedin, $portfolio]);
        $contactLine = implode(' | ', $contacts);
        return <<<HTML
<h1 class="cv-name">{$name}{$titleSuffix}</h1>
<div class="cv-contact">{$contactLine}</div>
HTML;
    }

    private static function renderSummaryHtml(string $template, array $data): string
    {
        if (empty($data['summary'])) {
            return '';
        }
        $summary = htmlspecialchars($data['summary']);
        return <<<HTML
<h2 class="cv-section-title">Ringkasan Profesional</h2>
<p class="cv-paragraph">{$summary}</p>
HTML;
    }

    private static function renderExperienceHtml(string $template, array $data): string
    {
        if (empty($data['experiences'])) {
            return '';
        }
        $html = '<h2 class="cv-section-title">Pengalaman Kerja</h2>';
        foreach ($data['experiences'] as $exp) {
            $pos = htmlspecialchars($exp['position']);
            $comp = htmlspecialchars($exp['company']);
            $loc = ! empty($exp['location']) ? ' &bull; ' . htmlspecialchars($exp['location']) : '';
            $period = htmlspecialchars($exp['period']);

            $bullets = '';
            if (! empty($exp['achievements'])) {
                $bullets .= '<ul class="cv-bullet-list">';
                foreach ($exp['achievements'] as $ach) {
                    $bullets .= '<li>' . htmlspecialchars($ach) . '</li>';
                }
                $bullets .= '</ul>';
            }

            $html .= <<<HTML
<table class="entry-table">
  <tr>
    <td class="entry-title">{$pos} <span class="entry-subtitle">| {$comp}{$loc}</span></td>
    <td class="entry-date">{$period}</td>
  </tr>
</table>
{$bullets}
HTML;
        }

        return $html;
    }

    private static function renderEducationHtml(string $template, array $data): string
    {
        if (empty($data['educations'])) {
            return '';
        }
        $html = '<h2 class="cv-section-title">Pendidikan</h2>';
        foreach ($data['educations'] as $edu) {
            $deg = htmlspecialchars($edu['degree']);
            $inst = htmlspecialchars($edu['institution']);
            $loc = ! empty($edu['location']) ? ' &bull; ' . htmlspecialchars($edu['location']) : '';
            $period = htmlspecialchars($edu['period']);
            $notes = ! empty($edu['notes']) ? '<div class="entry-subtitle" style="margin-bottom: 4pt;">' . htmlspecialchars($edu['notes']) . '</div>' : '';

            $html .= <<<HTML
<table class="entry-table">
  <tr>
    <td class="entry-title">{$deg} <span class="entry-subtitle">| {$inst}{$loc}</span></td>
    <td class="entry-date">{$period}</td>
  </tr>
</table>
{$notes}
HTML;
        }

        return $html;
    }

    private static function renderSkillsHtml(string $template, array $data): string
    {
        if (empty($data['skills'])) {
            return '';
        }
        $html = '<h2 class="cv-section-title">Keahlian & Kompetensi</h2>';
        $html .= '<ul class="cv-bullet-list">';
        foreach ($data['skills'] as $cat => $items) {
            $catLabel = is_string($cat) && ! is_numeric($cat) ? '<strong>' . htmlspecialchars($cat) . ':</strong> ' : '';
            $itemsList = is_array($items) ? implode(', ', array_map('htmlspecialchars', $items)) : htmlspecialchars((string) $items);
            $html .= '<li>' . $catLabel . $itemsList . '</li>';
        }
        $html .= '</ul>';
        return $html;
    }

    private static function renderProjectsHtml(string $template, array $data): string
    {
        if (empty($data['projects'])) {
            return '';
        }
        $html = '<h2 class="cv-section-title">Proyek & Portofolio</h2>';
        foreach ($data['projects'] as $p) {
            $name = htmlspecialchars($p['name']);
            $period = htmlspecialchars($p['period'] ?? '');
            $desc = htmlspecialchars($p['description'] ?? '');

            $html .= <<<HTML
<table class="entry-table">
  <tr>
    <td class="entry-title">{$name}</td>
    <td class="entry-date">{$period}</td>
  </tr>
</table>
<p class="cv-paragraph">{$desc}</p>
HTML;
        }
        return $html;
    }

    private static function renderCertificationsHtml(string $template, array $data): string
    {
        if (empty($data['certifications'])) {
            return '';
        }
        $html = '<h2 class="cv-section-title">Sertifikasi & Lisensi</h2>';
        $html .= '<ul class="cv-bullet-list">';
        foreach ($data['certifications'] as $c) {
            $name = htmlspecialchars($c['name']);
            $issuer = ! empty($c['issuer']) ? ' &mdash; ' . htmlspecialchars($c['issuer']) : '';
            $period = ! empty($c['period']) ? ' (' . htmlspecialchars($c['period']) . ')' : '';
            $html .= '<li>' . $name . $issuer . $period . '</li>';
        }
        $html .= '</ul>';
        return $html;
    }
}
