export type CvTemplateId = 'classic' | 'modern' | 'executive' | 'compact';

export interface CvExperience {
    position: string;
    company: string;
    location?: string;
    period: string;
    achievements: string[];
}

export interface CvEducation {
    degree: string;
    institution: string;
    location?: string;
    period: string;
    notes?: string;
}

export interface CvProject {
    name: string;
    period?: string;
    description: string;
}

export interface CvCertification {
    name: string;
    issuer?: string;
    period?: string;
}

export interface CvData {
    name: string;
    job_title: string;
    email: string;
    phone: string;
    domicile: string;
    linkedin: string;
    portfolio?: string;
    summary: string;
    experiences: CvExperience[];
    educations: CvEducation[];
    skills: Record<string, string[]>;
    projects: CvProject[];
    certifications: CvCertification[];
}

export interface CvTemplateMeta {
    id: CvTemplateId;
    name: string;
    tagline: string;
    badge: string;
    targetIndustry: string;
    fontFamily: string;
    headerLayout: string;
    dividerStyle: string;
    accentColor: string;
    accentSecondary: string;
    marginText: string;
    lineSpacing: string;
    description: string;
}

export const CV_TEMPLATES: CvTemplateMeta[] = [
    {
        id: 'classic',
        name: '01 Classic (Harvard Style)',
        tagline: 'Tradisional, Formal & Netral',
        badge: 'Serif • Harvard Standard',
        targetIndustry: 'Hukum, Keuangan, Akuntansi, Konsultan, Perbankan, BUMN, Pemerintahan, dan Akademik',
        fontFamily: 'Times New Roman / Georgia (Serif)',
        headerLayout: 'Rata Tengah (Center-aligned, 2 baris)',
        dividerStyle: 'Garis Solid Tipis (1 pt) membentang penuh 100%',
        accentColor: '#000000',
        accentSecondary: '#333333',
        marginText: '2,0 cm di semua sisi',
        lineSpacing: '1,15',
        description: 'Format baku terpercaya berstandar universitas Ivy League. Tampilan monokrom hitam-putih dengan pembacaan linear aman 100% dipindai seluruh mesin ATS.',
    },
    {
        id: 'modern',
        name: '02 Modern Minimalist',
        tagline: 'Bersih, Ringan & Kontemporer',
        badge: 'Sans-Serif • Classic Navy',
        targetIndustry: 'Startup, Teknologi / IT, Produk Digital, Pemasaran, Desain, dan Bisnis Umum',
        fontFamily: 'Calibri / Arial (Sans-serif)',
        headerLayout: 'Rata Kiri (Left-aligned, 3 baris dipisah •)',
        dividerStyle: 'Garis Halus 1 pt (#CBD5E1) + Jarak Lega',
        accentColor: '#0F4C81',
        accentSecondary: '#4B5563',
        marginText: '1,8 – 2,0 cm',
        lineSpacing: '1,20',
        description: 'Tampilan rapi dan segar dengan sentuhan warna aksen Classic Navy pada nama dan judul bagian. Memberi kesan profesional modern tanpa mengorbankan keterbacaan ATS.',
    },
    {
        id: 'executive',
        name: '03 Executive Formal',
        tagline: 'Tegas dengan Hierarki Visual Kuat',
        badge: 'Shaded Bar • Deep Navy',
        targetIndustry: 'Mid-to-Senior, Manajerial, Perbankan Korporat, BUMN, Manufaktur, dan Operasional',
        fontFamily: 'Cambria / Trebuchet MS (Serif / Humanist)',
        headerLayout: 'Rata Kiri + Garis Aksen Tebal Penutup (2 pt)',
        dividerStyle: 'Arsiran Latar Judul (#F3F4F6) + Garis Bawah Aksen (#1B365D)',
        accentColor: '#1B365D',
        accentSecondary: '#F3F4F6',
        marginText: '2,0 cm di semua sisi',
        lineSpacing: '1,15',
        description: 'Struktur kepemimpinan berwibawa dengan latar arsiran abu-abu lembut dan garis bawah Deep Navy pada setiap segmen. Sangat menonjolkan rekam jejak karir senior.',
    },
    {
        id: 'compact',
        name: '04 Compact Clean',
        tagline: 'Padat 1 Halaman Rapi & Terstruktur',
        badge: 'Compact • 1 Halaman Rapi',
        targetIndustry: 'Software Engineer, Peneliti, Fresh Graduate, Tenaga Teknis dengan banyak proyek/organisasi',
        fontFamily: 'Calibri / Arial (Sans-serif ringkas)',
        headerLayout: 'Rata Kiri Ringkas (2 baris hemat ruang 30%)',
        dividerStyle: 'Garis Tipis 0,5 pt (#9CA3AF) + Padding Rapat',
        accentColor: '#2D3748',
        accentSecondary: '#555555',
        marginText: '1,27 – 1,5 cm (Batas aman cetak)',
        lineSpacing: '1,08 – 1,12',
        description: 'Optimalisasi ruang vertikal maksimal untuk memadatkan seluruh pengalaman, proyek, dan keahlian ke dalam tepat 1 halaman penuh tanpa mengurangi kerapian pemindaian ATS.',
    },
];

export function getSampleCvData(): CvData {
    return {
        name: 'BUDI SANTOSO',
        job_title: 'Frontend Web & Accessibility Specialist',
        email: 'budi.santoso@email.com',
        phone: '+62 812-3456-7890',
        domicile: 'Jakarta Selatan, Indonesia',
        linkedin: 'linkedin.com/in/budisantoso',
        portfolio: 'budisantoso.dev',
        summary:
            'Profesional pengembang web dengan pengalaman lebih dari 3 tahun dalam membangun antarmuka web interaktif, berkinerja tinggi, dan ramah aksesibilitas (WCAG 2.1 AA). Terbiasa berkolaborasi dengan tim lintas disiplin untuk menghasilkan solusi digital yang inklusif, terukur, dan berdampak nyata bagi ribuan pengguna aktif bulanan.',
        experiences: [
            {
                position: 'Senior Frontend Developer',
                company: 'PT Teknologi Inklusi Nusantara',
                location: 'Jakarta (Hybrid)',
                period: 'Jan 2024 - Sekarang',
                achievements: [
                    'Memimpin re-arsitektur antarmuka web dengan React dan TypeScript, meningkatkan kecepatan muat halaman sebesar 38%.',
                    'Menerapkan standar aksesibilitas WCAG 2.1 AA di seluruh portal karier, meningkatkan kepuasan pengguna penyandang disabilitas hingga 94%.',
                    'Mengurangi error pemindaian CV ATS dengan merancang alur dokumen terstruktur yang memproses lebih dari 10.000 pelamar per bulan.',
                ],
            },
            {
                position: 'Frontend Web Developer',
                company: 'PT Solusi Digital Bersama',
                location: 'Bandung (Remote)',
                period: 'Agu 2022 - Des 2023',
                achievements: [
                    'Mengembangkan lebih dari 15 modul dashboard interaktif dengan Tailwind CSS dan Inertia.js untuk klien enterprise.',
                    'Mengoptimalkan ukuran bundel JavaScript sebesar 45% melalui code-splitting dan tree-shaking efisien.',
                    'Berkolaborasi aktif dengan tim QA dan Backend untuk merancang RESTful API contracts yang konsisten.',
                ],
            },
        ],
        educations: [
            {
                degree: 'Sarjana Komputer (S.Kom) - Teknik Informatika',
                institution: 'Universitas Indonesia',
                location: 'Depok, Jawa Barat',
                period: '2018 - 2022',
                notes: 'IPK: 3.82 / 4.00 (Cum Laude). Fokus Tugas Akhir: Desain Antarmuka Inklusif untuk Pembaca Layar.',
            },
        ],
        skills: {
            'Keahlian Teknis': [
                'React.js',
                'TypeScript',
                'JavaScript (ES6+)',
                'Tailwind CSS',
                'HTML5 & CSS3 Semantic',
                'Inertia.js',
                'RESTful API',
                'Git & CI/CD',
            ],
            'Aksesibilitas & Standar': [
                'WCAG 2.1 AA',
                'Screen Reader Optimization (NVDA/JAWS)',
                'WAI-ARIA',
                'Semantic Document Structure',
                'ATS Optimization',
            ],
            'Soft Skills': [
                'Problem Solving',
                'Komunikasi Empatik',
                'Kerja Sama Tim Lintas Fungsi',
                'Manajemen Waktu Terstruktur',
            ],
        },
        projects: [
            {
                name: 'Profabel Career Portal',
                period: '2024',
                description:
                    'Platform rekrutmen tenaga kerja ramah disabilitas pertama dengan fitur AI Job Matching dan ATS CV Reviewer real-time.',
            },
            {
                name: 'Accessible Design System Library',
                period: '2023',
                description:
                    'Komponen UI open-source dengan kepatuhan kontras 5:1 dan dukungan navigasi keyboard penuh.',
            },
        ],
        certifications: [
            {
                name: 'Certified Professional in Accessibility Core Competencies (CPACC)',
                issuer: 'IAAP',
                period: '2024',
            },
            {
                name: 'Google Cloud Associate Cloud Engineer',
                issuer: 'Google',
                period: '2023',
            },
        ],
    };
}

export function buildProfileCvData(seeker: any, user: any): CvData {
    const sample = getSampleCvData();
    const name = (user?.name || sample.name).toUpperCase();
    const jobTitle = seeker?.current_job_title || sample.job_title;
    const email = user?.email || sample.email;
    const phone = seeker?.phone || sample.phone;
    const domicile = seeker?.domicile || sample.domicile;
    const linkedin = seeker?.linkedin_url || sample.linkedin;
    const portfolio = seeker?.portfolio_url || sample.portfolio;
    const summary = seeker?.bio || sample.summary;

    // Experiences
    let experiences: CvExperience[] = [];
    if (Array.isArray(seeker?.work_experiences) && seeker.work_experiences.length > 0) {
        experiences = seeker.work_experiences
            .filter((item: any) => typeof item === 'object' && item !== null)
            .map((item: any) => {
                let achievements: string[] = [];
                if (typeof item.description === 'string' && item.description.trim()) {
                    achievements = item.description
                        .split(/\r?\n/)
                        .map((l: string) => l.replace(/^[-•* \t]+/, '').trim())
                        .filter((l: string) => l.length > 3);
                }
                if (achievements.length === 0) {
                    achievements = [
                        'Menjalankan tugas dan tanggung jawab posisi secara konsisten dengan hasil kerja terukur.',
                    ];
                }
                const start = item.start_date || '';
                const end = item.end_date || 'Sekarang';
                const period = start || end ? `${start} - ${end}` : 'Periode Kerja';
                return {
                    position: item.position || 'Staf Profesional',
                    company: item.company || 'Perusahaan',
                    location: item.location || '',
                    period,
                    achievements,
                };
            });
    }
    if (experiences.length === 0) {
        experiences = sample.experiences;
    }

    // Educations
    let educations: CvEducation[] = [];
    if (Array.isArray(seeker?.educations) && seeker.educations.length > 0) {
        educations = seeker.educations
            .filter((item: any) => typeof item === 'object' && item !== null)
            .map((item: any) => {
                const start = item.start_year || '';
                const end = item.end_year || '';
                const period = start || end ? `${start} - ${end}` : 'Lulus';
                return {
                    degree: item.degree || 'Pendidikan Formal',
                    institution: item.institution || 'Institusi Pendidikan',
                    location: item.location || '',
                    period,
                    notes: '',
                };
            });
    } else if (seeker?.education) {
        educations = [
            {
                degree: seeker.education,
                institution: 'Institusi Pendidikan Formal Terdaftar',
                location: domicile,
                period: 'Lulus',
            },
        ];
    } else {
        educations = sample.educations;
    }

    // Skills
    let skills: Record<string, string[]> = {};
    if (Array.isArray(seeker?.skills) && seeker.skills.length > 0) {
        const stringSkills = seeker.skills.filter(
            (s: any): s is string => typeof s === 'string' && s.trim().length > 0
        );
        if (stringSkills.length > 0) {
            skills['Keahlian Utama'] = stringSkills;
        }
    }
    if (Object.keys(skills).length === 0) {
        skills = sample.skills;
    }

    // Projects
    let projects: CvProject[] = [];
    if (Array.isArray(seeker?.projects) && seeker.projects.length > 0) {
        projects = seeker.projects
            .filter((item: any) => typeof item === 'object' && item !== null && item.name)
            .map((item: any) => ({
                name: item.name,
                period: '',
                description: item.description || '',
            }));
    }
    if (projects.length === 0) {
        projects = sample.projects;
    }

    // Certifications
    let certifications: CvCertification[] = [];
    if (Array.isArray(seeker?.certifications) && seeker.certifications.length > 0) {
        certifications = seeker.certifications
            .filter((item: any) => typeof item === 'object' && item !== null && item.name)
            .map((item: any) => ({
                name: item.name,
                issuer: item.issuer || '',
                period: item.year ? String(item.year) : '',
            }));
    }
    if (certifications.length === 0) {
        certifications = sample.certifications;
    }

    return {
        name,
        job_title: jobTitle,
        email,
        phone,
        domicile,
        linkedin,
        portfolio,
        summary,
        experiences,
        educations,
        skills,
        projects,
        certifications,
    };
}

export function generatePlainTextCv(template: CvTemplateId, data: CvData): string {
    const lines: string[] = [];

    lines.push(data.name);
    if (template === 'compact' && data.job_title) {
        lines.push(`${data.name} — ${data.job_title}`);
    } else if (data.job_title) {
        lines.push(data.job_title);
    }

    const contacts = [data.domicile, data.email, data.phone, data.linkedin, data.portfolio].filter(Boolean);
    const separator = template === 'modern' ? ' • ' : ' | ';
    lines.push(contacts.join(separator));
    lines.push('');

    if (data.summary) {
        lines.push('--- RINGKASAN PROFESIONAL ---');
        lines.push(data.summary);
        lines.push('');
    }

    if (data.experiences.length > 0) {
        lines.push('--- PENGALAMAN KERJA ---');
        data.experiences.forEach((exp) => {
            lines.push(`${exp.position} | ${exp.company}${exp.location ? ` (${exp.location})` : ''} [${exp.period}]`);
            exp.achievements.forEach((ach) => {
                lines.push(`  • ${ach}`);
            });
            lines.push('');
        });
    }

    if (data.educations.length > 0) {
        lines.push('--- PENDIDIKAN ---');
        data.educations.forEach((edu) => {
            lines.push(`${edu.degree} | ${edu.institution}${edu.location ? ` (${edu.location})` : ''} [${edu.period}]`);
            if (edu.notes) lines.push(`  ${edu.notes}`);
        });
        lines.push('');
    }

    if (Object.keys(data.skills).length > 0) {
        lines.push('--- KEAHLIAN & KOMPETENSI ---');
        Object.entries(data.skills).forEach(([category, items]) => {
            lines.push(`• ${category}: ${items.join(', ')}`);
        });
        lines.push('');
    }

    if (data.projects.length > 0) {
        lines.push('--- PROYEK & PORTOFOLIO ---');
        data.projects.forEach((proj) => {
            lines.push(`• ${proj.name}${proj.period ? ` [${proj.period}]` : ''}: ${proj.description}`);
        });
        lines.push('');
    }

    if (data.certifications.length > 0) {
        lines.push('--- SERTIFIKASI & LISENSI ---');
        data.certifications.forEach((cert) => {
            lines.push(`• ${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.period ? ` (${cert.period})` : ''}`);
        });
        lines.push('');
    }

    return lines.join('\n');
}

export function downloadDocxTemplate(template: CvTemplateId, data: CvData): void {
    const templateNames: Record<CvTemplateId, string> = {
        classic: 'Classic_Harvard_Style',
        modern: 'Modern_Minimalist',
        executive: 'Executive_Formal',
        compact: 'Compact_Clean',
    };

    const cleanName = data.name.replace(/[^A-Za-z0-9_]/g, '').replace(/\s+/g, '_') || 'Pelamar';
    const filename = `Template_CV_ATS_${templateNames[template]}_${cleanName}.doc`;

    // Construct Word XML/HTML blob
    const html = buildWordDocumentHtml(template, data);
    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword;charset=utf-8',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildWordDocumentHtml(template: CvTemplateId, data: CvData): string {
    const isClassic = template === 'classic';
    const isModern = template === 'modern';
    const isExecutive = template === 'executive';
    const isCompact = template === 'compact';

    const font = isClassic
        ? "'Times New Roman', Georgia, serif"
        : isExecutive
        ? "Cambria, 'Trebuchet MS', Georgia, serif"
        : "Calibri, Arial, 'Segoe UI', sans-serif";

    const marginCm = isCompact ? '1.3cm' : isModern ? '1.9cm' : '2.0cm';
    const baseFontSize = isCompact ? '9.5pt' : isModern ? '10pt' : '10.5pt';
    const baseLineHeight = isCompact ? '1.1' : isModern ? '1.2' : '1.15';
    const textColor = isCompact ? '#111111' : isModern ? '#1F2937' : isExecutive ? '#111827' : '#000000';
    const accentColor = isModern ? '#0F4C81' : isExecutive ? '#1B365D' : isCompact ? '#2D3748' : '#000000';

    let headerHtml = '';
    const contacts = [data.domicile, data.email, data.phone, data.linkedin, data.portfolio].filter(Boolean).map(escapeHtml);

    if (isClassic) {
        headerHtml = `
            <h1 style="font-size: 17pt; font-weight: bold; text-transform: uppercase; text-align: center; margin: 0 0 4pt 0; color: #000000;">
                ${escapeHtml(data.name)}
            </h1>
            <div style="font-size: 10pt; text-align: center; color: #333333; margin: 0 0 12pt 0;">
                ${contacts.join(' | ')}
            </div>
        `;
    } else if (isModern) {
        headerHtml = `
            <h1 style="font-size: 19pt; font-weight: bold; text-align: left; margin: 0 0 2pt 0; color: #0F4C81;">
                ${escapeHtml(data.name)}
            </h1>
            ${data.job_title ? `<div style="font-size: 11pt; color: #4B5563; margin: 0 0 3pt 0;">${escapeHtml(data.job_title)}</div>` : ''}
            <div style="font-size: 9.5pt; color: #4B5563; margin: 0 0 14pt 0;">
                ${contacts.join(' &bull; ')}
            </div>
        `;
    } else if (isExecutive) {
        headerHtml = `
            <h1 style="font-size: 18pt; font-weight: bold; text-transform: uppercase; text-align: left; margin: 0 0 2pt 0; color: #1B365D;">
                ${escapeHtml(data.name)}
            </h1>
            ${data.job_title ? `<div style="font-size: 11pt; color: #4B5563; margin: 0 0 3pt 0;">${escapeHtml(data.job_title)}</div>` : ''}
            <div style="font-size: 10pt; color: #4B5563; margin: 0 0 6pt 0;">
                ${contacts.join(' | ')}
            </div>
            <div style="border-bottom: 2pt solid #1B365D; margin-bottom: 12pt;"></div>
        `;
    } else {
        // Compact Clean
        const roleSuffix = data.job_title ? ` &mdash; ${escapeHtml(data.job_title)}` : '';
        headerHtml = `
            <h1 style="font-size: 15.5pt; font-weight: bold; text-align: left; margin: 0 0 2pt 0; color: #111111;">
                ${escapeHtml(data.name)}${roleSuffix}
            </h1>
            <div style="font-size: 9pt; color: #555555; margin: 0 0 8pt 0;">
                ${contacts.join(' | ')}
            </div>
        `;
    }

    const sectionTitleStyle = isExecutive
        ? `font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #1B365D; background-color: #F3F4F6; border-bottom: 1.5pt solid #1B365D; padding: 3pt 6pt; margin: 14pt 0 5pt 0;`
        : isModern
        ? `font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5pt; color: #0F4C81; border-bottom: 1pt solid #CBD5E1; padding-bottom: 3pt; margin: 14pt 0 5pt 0;`
        : isCompact
        ? `font-size: 10.5pt; font-weight: bold; text-transform: uppercase; color: #2D3748; border-bottom: 0.5pt solid #9CA3AF; padding-bottom: 2pt; margin: 10pt 0 3pt 0;`
        : `font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #000000; border-bottom: 1pt solid #000000; padding-bottom: 2pt; margin: 12pt 0 4pt 0;`;

    // Experiences
    let expHtml = '';
    if (data.experiences.length > 0) {
        expHtml += `<h2 style="${sectionTitleStyle}">Pengalaman Kerja</h2>`;
        data.experiences.forEach((exp) => {
            const pos = escapeHtml(exp.position);
            const comp = escapeHtml(exp.company);
            const loc = exp.location ? ` &bull; ${escapeHtml(exp.location)}` : '';
            const period = escapeHtml(exp.period);

            const bullets = exp.achievements
                .map((a) => `<li style="margin-bottom: ${isCompact ? '1.5pt' : '2pt'};">${escapeHtml(a)}</li>`)
                .join('');

            expHtml += `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
                    <tr>
                        <td style="vertical-align: top; font-weight: bold; font-size: ${isCompact ? '10pt' : '10.5pt'}; color: ${textColor};">
                            ${pos} <span style="font-weight: normal; font-size: 9.5pt; color: #4B5563;">| ${comp}${loc}</span>
                        </td>
                        <td style="vertical-align: top; text-align: right; font-size: 9.5pt; color: #4B5563; white-space: nowrap;">
                            ${period}
                        </td>
                    </tr>
                </table>
                <ul style="margin: 2pt 0 6pt 16pt; padding: 0; list-style-type: disc;">
                    ${bullets}
                </ul>
            `;
        });
    }

    // Educations
    let eduHtml = '';
    if (data.educations.length > 0) {
        eduHtml += `<h2 style="${sectionTitleStyle}">Pendidikan</h2>`;
        data.educations.forEach((edu) => {
            const deg = escapeHtml(edu.degree);
            const inst = escapeHtml(edu.institution);
            const loc = edu.location ? ` &bull; ${escapeHtml(edu.location)}` : '';
            const period = escapeHtml(edu.period);
            const notes = edu.notes ? `<div style="font-size: 9.5pt; color: #4B5563; margin-bottom: 3pt;">${escapeHtml(edu.notes)}</div>` : '';

            eduHtml += `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
                    <tr>
                        <td style="vertical-align: top; font-weight: bold; font-size: ${isCompact ? '10pt' : '10.5pt'}; color: ${textColor};">
                            ${deg} <span style="font-weight: normal; font-size: 9.5pt; color: #4B5563;">| ${inst}${loc}</span>
                        </td>
                        <td style="vertical-align: top; text-align: right; font-size: 9.5pt; color: #4B5563; white-space: nowrap;">
                            ${period}
                        </td>
                    </tr>
                </table>
                ${notes}
            `;
        });
    }

    // Skills
    let skillsHtml = '';
    if (Object.keys(data.skills).length > 0) {
        skillsHtml += `<h2 style="${sectionTitleStyle}">Keahlian & Kompetensi</h2>`;
        const items = Object.entries(data.skills)
            .map(([cat, list]) => `<li style="margin-bottom: 2pt;"><strong>${escapeHtml(cat)}:</strong> ${escapeHtml(list.join(', '))}</li>`)
            .join('');
        skillsHtml += `<ul style="margin: 2pt 0 6pt 16pt; padding: 0; list-style-type: disc;">${items}</ul>`;
    }

    // Projects
    let projHtml = '';
    if (data.projects.length > 0) {
        projHtml += `<h2 style="${sectionTitleStyle}">Proyek & Portofolio</h2>`;
        data.projects.forEach((p) => {
            projHtml += `
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 1pt;">
                    <tr>
                        <td style="vertical-align: top; font-weight: bold; font-size: ${isCompact ? '10pt' : '10.5pt'}; color: ${textColor};">
                            ${escapeHtml(p.name)}
                        </td>
                        <td style="vertical-align: top; text-align: right; font-size: 9.5pt; color: #4B5563; white-space: nowrap;">
                            ${escapeHtml(p.period || '')}
                        </td>
                    </tr>
                </table>
                <p style="margin: 0 0 5pt 0; font-size: ${baseFontSize}; line-height: ${baseLineHeight};">${escapeHtml(p.description)}</p>
            `;
        });
    }

    // Certifications
    let certHtml = '';
    if (data.certifications.length > 0) {
        certHtml += `<h2 style="${sectionTitleStyle}">Sertifikasi & Lisensi</h2>`;
        const items = data.certifications
            .map(
                (c) =>
                    `<li style="margin-bottom: 2pt;">${escapeHtml(c.name)}${c.issuer ? ` &mdash; ${escapeHtml(c.issuer)}` : ''}${c.period ? ` (${escapeHtml(c.period)})` : ''}</li>`
            )
            .join('');
        certHtml += `<ul style="margin: 2pt 0 6pt 16pt; padding: 0; list-style-type: disc;">${items}</ul>`;
    }

    return `
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
@page Section1 {
    size: 21.0cm 29.7cm;
    margin: ${marginCm} ${marginCm} ${marginCm} ${marginCm};
    mso-header-margin: 0cm;
    mso-footer-margin: 0cm;
    mso-paper-source: 0;
}
div.Section1 { page: Section1; }
body {
    font-family: ${font};
    font-size: ${baseFontSize};
    line-height: ${baseLineHeight};
    color: ${textColor};
    background-color: #FFFFFF;
}
</style>
</head>
<body>
<div class="Section1">
    ${headerHtml}
    ${data.summary ? `<h2 style="${sectionTitleStyle}">Ringkasan Profesional</h2><p style="margin: 0 0 6pt 0; text-align: justify;">${escapeHtml(data.summary)}</p>` : ''}
    ${expHtml}
    ${eduHtml}
    ${skillsHtml}
    ${projHtml}
    ${certHtml}
</div>
</body>
</html>
    `.trim();
}
