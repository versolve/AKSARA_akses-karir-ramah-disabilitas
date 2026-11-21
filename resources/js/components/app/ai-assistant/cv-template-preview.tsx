import { type CvData, type CvTemplateId } from './cv-template-types';

interface CvTemplatePreviewProps {
    template: CvTemplateId;
    data: CvData;
    zoom?: number; // percentage, e.g. 100, 115, 125, 140
}

export default function CvTemplatePreview({
    template,
    data,
    zoom = 110,
}: CvTemplatePreviewProps) {
    const isClassic = template === 'classic';
    const isModern = template === 'modern';
    const isExecutive = template === 'executive';
    const isCompact = template === 'compact';

    // Contacts
    const contactItems = [
        data.domicile,
        data.email,
        data.phone,
        data.linkedin,
        data.portfolio,
    ].filter(Boolean);

    // Font Family class
    const fontClass = isClassic
        ? 'font-serif'
        : isExecutive
        ? 'font-serif'
        : 'font-sans';

    const zoomScale = zoom / 100;

    return (
        <div
            className="transition-transform duration-200 origin-top flex justify-center"
            style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
            }}
        >
            <div
                id="cv-printable-area"
                className={`w-full max-w-[860px] bg-white text-left select-text rounded-xs transition-shadow duration-200 ${fontClass} ${
                    isCompact
                        ? 'p-8 sm:p-11 text-[14px] leading-[1.32] text-[#111111]'
                        : isModern
                        ? 'p-9 sm:p-14 text-[14.5px] leading-[1.4] text-[#1F2937]'
                        : isExecutive
                        ? 'p-9 sm:p-14 text-[14.5px] leading-[1.38] text-[#111827]'
                        : 'p-9 sm:p-14 text-[14.5px] leading-[1.38] text-black'
                }`}
                style={{
                    boxShadow:
                        '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    minHeight: '1180px',
                }}
            >
                {/* Header Layout */}
                {isClassic && (
                    <header className="text-center mb-6 pb-1">
                        <h1 className="text-[26px] sm:text-[28px] font-bold uppercase tracking-wider text-black leading-tight">
                            {data.name}
                        </h1>
                        <div className="mt-1.5 text-[13px] sm:text-[13.5px] text-[#333333] flex flex-wrap justify-center items-center gap-x-2.5">
                            {contactItems.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-x-2.5">
                                    <span>{item}</span>
                                    {idx < contactItems.length - 1 && (
                                        <span className="text-[#888888] font-bold">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </header>
                )}

                {isModern && (
                    <header className="mb-6 pb-1">
                        <h1 className="text-[28px] sm:text-[30px] font-bold text-[#0F4C81] tracking-tight leading-tight">
                            {data.name}
                        </h1>
                        {data.job_title && (
                            <p className="text-[15.5px] font-semibold text-[#4B5563] mt-0.5">
                                {data.job_title}
                            </p>
                        )}
                        <div className="mt-2 text-[13px] sm:text-[13.5px] text-[#4B5563] flex flex-wrap items-center gap-x-2.5">
                            {contactItems.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-x-2.5">
                                    <span>{item}</span>
                                    {idx < contactItems.length - 1 && (
                                        <span className="text-[#0F4C81] font-bold">•</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </header>
                )}

                {isExecutive && (
                    <header className="mb-6 pb-2">
                        <h1 className="text-[26px] sm:text-[28px] font-bold uppercase text-[#1B365D] tracking-wide leading-tight">
                            {data.name}
                        </h1>
                        {data.job_title && (
                            <p className="text-[15.5px] font-semibold text-[#4B5563] mt-0.5">
                                {data.job_title}
                            </p>
                        )}
                        <div className="mt-1.5 text-[13px] sm:text-[13.5px] text-[#4B5563] flex flex-wrap items-center gap-x-2.5">
                            {contactItems.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-x-2.5">
                                    <span>{item}</span>
                                    {idx < contactItems.length - 1 && (
                                        <span className="text-[#9CA3AF]">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                        {/* Header closure thick bar */}
                        <div className="mt-3 h-[3px] bg-[#1B365D] w-full" />
                    </header>
                )}

                {isCompact && (
                    <header className="mb-4 pb-1">
                        <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] leading-tight">
                            {data.name}
                            {data.job_title && (
                                <span className="font-semibold text-[#2D3748] text-[16px] sm:text-[17px]">
                                    {' '}
                                    — {data.job_title}
                                </span>
                            )}
                        </h1>
                        <div className="mt-1 text-[12.5px] sm:text-[13px] text-[#555555] flex flex-wrap items-center gap-x-2">
                            {contactItems.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-x-2">
                                    <span>{item}</span>
                                    {idx < contactItems.length - 1 && (
                                        <span className="text-[#9CA3AF]">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </header>
                )}

                {/* Summary */}
                {data.summary && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Ringkasan Profesional"
                        />
                        <p className="text-justify leading-relaxed mt-1.5 text-slate-800">
                            {data.summary}
                        </p>
                    </section>
                )}

                {/* Experiences */}
                {data.experiences.length > 0 && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Pengalaman Kerja"
                        />
                        <div className="mt-2 space-y-3.5">
                            {data.experiences.map((exp, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                        <div className="font-bold text-slate-900 text-[14.5px] sm:text-[15px]">
                                            <span>{exp.position}</span>
                                            <span className="font-normal text-slate-600 text-[13.5px] sm:text-[14px]">
                                                {' | '}
                                                {exp.company}
                                                {exp.location && ` • ${exp.location}`}
                                            </span>
                                        </div>
                                        <div className="text-[12.5px] sm:text-[13px] font-medium text-slate-500 whitespace-nowrap">
                                            {exp.period}
                                        </div>
                                    </div>
                                    {exp.achievements.length > 0 && (
                                        <ul className="mt-1 pl-4 space-y-1 list-disc text-slate-700">
                                            {exp.achievements.map((ach, aIdx) => (
                                                <li key={aIdx} className="leading-snug">
                                                    {ach}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Educations */}
                {data.educations.length > 0 && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Pendidikan"
                        />
                        <div className="mt-2 space-y-2.5">
                            {data.educations.map((edu, idx) => (
                                <div key={idx}>
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                        <div className="font-bold text-slate-900 text-[14.5px] sm:text-[15px]">
                                            <span>{edu.degree}</span>
                                            <span className="font-normal text-slate-600 text-[13.5px] sm:text-[14px]">
                                                {' | '}
                                                {edu.institution}
                                                {edu.location && ` • ${edu.location}`}
                                            </span>
                                        </div>
                                        <div className="text-[12.5px] sm:text-[13px] font-medium text-slate-500 whitespace-nowrap">
                                            {edu.period}
                                        </div>
                                    </div>
                                    {edu.notes && (
                                        <p className="mt-0.5 text-[13px] text-slate-600 italic">
                                            {edu.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {Object.keys(data.skills).length > 0 && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Keahlian & Kompetensi"
                        />
                        <ul className="mt-2 pl-4 space-y-1.5 list-disc text-slate-700">
                            {Object.entries(data.skills).map(([category, items], idx) => (
                                <li key={idx} className="leading-snug">
                                    <strong className="text-slate-900">{category}: </strong>
                                    <span>{items.join(', ')}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Projects */}
                {data.projects.length > 0 && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Proyek & Portofolio"
                        />
                        <div className="mt-2 space-y-2.5">
                            {data.projects.map((proj, idx) => (
                                <div key={idx}>
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="font-bold text-slate-900 text-[14.5px] sm:text-[15px]">
                                            {proj.name}
                                        </span>
                                        {proj.period && (
                                            <span className="text-[12.5px] text-slate-500 whitespace-nowrap">
                                                {proj.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-slate-700 leading-snug mt-0.5">
                                        {proj.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certifications */}
                {data.certifications.length > 0 && (
                    <section className={isCompact ? 'mb-3.5' : 'mb-5'}>
                        <SectionTitle
                            template={template}
                            title="Sertifikasi & Lisensi"
                        />
                        <ul className="mt-2 pl-4 space-y-1 list-disc text-slate-700">
                            {data.certifications.map((c, idx) => (
                                <li key={idx} className="leading-snug">
                                    <span className="font-semibold text-slate-900">{c.name}</span>
                                    {c.issuer && ` — ${c.issuer}`}
                                    {c.period && ` (${c.period})`}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

function SectionTitle({ template, title }: { template: CvTemplateId; title: string }) {
    if (template === 'executive') {
        return (
            <h2 className="text-[14.5px] sm:text-[15.5px] font-bold uppercase tracking-wider text-[#1B365D] bg-[#F3F4F6] border-b-[2px] border-[#1B365D] py-1.5 px-3 -mx-3 rounded-xs">
                {title}
            </h2>
        );
    }

    if (template === 'modern') {
        return (
            <h2 className="text-[14.5px] sm:text-[15.5px] font-bold uppercase tracking-wider text-[#0F4C81] border-b border-[#CBD5E1] pb-1.5">
                {title}
            </h2>
        );
    }

    if (template === 'compact') {
        return (
            <h2 className="text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wide text-[#2D3748] border-b border-[#9CA3AF] pb-1">
                {title}
            </h2>
        );
    }

    // Classic Harvard
    return (
        <h2 className="text-[14.5px] sm:text-[15.5px] font-bold uppercase tracking-wider text-black border-b border-black pb-1">
            {title}
        </h2>
    );
}
