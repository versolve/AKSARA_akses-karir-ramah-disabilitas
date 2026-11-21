import { Button } from '@/components/ui/button';
import {
    Download,
    Eye,
    FileDown,
    FileText,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CvTemplateModal from './cv-template-modal';
import {
    CV_TEMPLATES,
    buildProfileCvData,
    downloadDocxTemplate,
    type CvTemplateId,
} from './cv-template-types';

interface CvTemplateCardProps {
    seeker?: any;
    user?: any;
}

export default function CvTemplateCard({ seeker, user }: CvTemplateCardProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<CvTemplateId>('classic');

    const handleOpenModal = (templateId?: CvTemplateId) => {
        if (templateId) {
            setActiveTemplate(templateId);
        }
        setModalOpen(true);
    };

    const handleQuickDownload = (templateId: CvTemplateId, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = buildProfileCvData(seeker, user);
        downloadDocxTemplate(templateId, data);
        const tmpl = CV_TEMPLATES.find((t) => t.id === templateId);
        toast.success(`Template ${tmpl?.name ?? ''} berhasil diunduh dalam format Word (.doc)!`);
    };

    return (
        <>
            <div className="rounded-2xl border border-[#DCEAF2] bg-white p-5 shadow-sm transition-all hover:border-[#B5D5EE]">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FD] text-[#1674D1]">
                            <FileDown className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-extrabold text-[#102B4B]">
                                    Template CV ATS-Friendly
                                </h3>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F4FD] text-[#0F4C81]">
                                    4 Tema
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Standar satu-kolom aman dipindai mesin ATS
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    Belum punya CV berstandar ATS atau ingin memperbarui format? Pilih dan unduh 4 template siap pakai (Word .doc & cetak PDF) yang sudah disesuaikan dengan profil Anda:
                </p>

                {/* 4 Template Mini Cards */}
                <div className="mt-3 space-y-2">
                    {CV_TEMPLATES.map((tmpl) => (
                        <div
                            key={tmpl.id}
                            onClick={() => handleOpenModal(tmpl.id)}
                            className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-[#F0F7FF] hover:border-[#1674D1]/40 transition-all cursor-pointer text-xs"
                        >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                    style={{ backgroundColor: tmpl.accentColor }}
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-800 group-hover:text-[#1674D1] truncate">
                                        {tmpl.name}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        {tmpl.tagline}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={(e) => handleQuickDownload(tmpl.id, e)}
                                    title="Unduh langsung format Word (.doc)"
                                    className="p-1.5 text-slate-400 hover:text-[#1674D1] hover:bg-white rounded-lg transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal(tmpl.id)}
                                    title="Lihat Pratinjau Dokumen"
                                    className="p-1.5 text-slate-400 hover:text-[#1674D1] hover:bg-white rounded-lg transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <Button
                        type="button"
                        onClick={() => handleOpenModal('classic')}
                        className="w-full bg-[#1674D1] hover:bg-[#125EB0] text-white font-semibold text-xs py-2.5 h-auto flex items-center justify-center gap-2 shadow-xs"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buka & Unduh Template CV</span>
                    </Button>
                </div>
            </div>

            {/* Modal */}
            <CvTemplateModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                seeker={seeker}
                user={user}
                initialTemplate={activeTemplate}
            />
        </>
    );
}
