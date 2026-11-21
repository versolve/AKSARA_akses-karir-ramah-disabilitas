import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    Copy,
    Download,
    FileCheck,
    FileText,
    Info,
    Maximize2,
    Minimize2,
    Minus,
    Plus,
    Printer,
    RotateCcw,
    Sparkles,
    UserCheck,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import CvTemplatePreview from './cv-template-preview';
import {
    CV_TEMPLATES,
    buildProfileCvData,
    downloadDocxTemplate,
    generatePlainTextCv,
    getSampleCvData,
    type CvData,
    type CvTemplateId,
} from './cv-template-types';

interface CvTemplateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    seeker?: any;
    user?: any;
    initialTemplate?: CvTemplateId;
}

export default function CvTemplateModal({
    open,
    onOpenChange,
    seeker,
    user,
    initialTemplate = 'classic',
}: CvTemplateModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<CvTemplateId>(initialTemplate);
    const [dataSource, setDataSource] = useState<'profile' | 'sample'>('profile');
    const [zoom, setZoom] = useState<number>(115); // Default 115% zoom for large clear preview
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    // Build user profile data vs sample data
    const profileData = useMemo(() => buildProfileCvData(seeker, user), [seeker, user]);
    const sampleData = useMemo(() => getSampleCvData(), []);

    const activeData: CvData = dataSource === 'profile' ? profileData : sampleData;
    const currentMeta = CV_TEMPLATES.find((t) => t.id === selectedTemplate) || CV_TEMPLATES[0];

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 15, 175));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 15, 75));
    };

    const handleResetZoom = () => {
        setZoom(115);
    };

    const handleDownloadDoc = () => {
        downloadDocxTemplate(selectedTemplate, activeData);
        toast.success(`Template ${currentMeta.name} berhasil diunduh dalam format Word (.doc)!`);
    };

    const handleCopyText = () => {
        const text = generatePlainTextCv(selectedTemplate, activeData);
        navigator.clipboard.writeText(text);
        toast.success('Teks CV format ATS berhasil disalin ke clipboard!');
    };

    const handlePrint = () => {
        const printContent = document.getElementById('cv-printable-area');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=900,height=800');
        if (!printWindow) {
            toast.error('Gagal membuka jendela cetak. Pastikan pop-up diizinkan browser.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>CV ATS - ${activeData.name} (${currentMeta.name})</title>
                <meta charset="utf-8">
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page {
                        size: A4;
                        margin: ${selectedTemplate === 'compact' ? '1.3cm' : selectedTemplate === 'modern' ? '1.9cm' : '2.0cm'};
                    }
                    body {
                        background: #ffffff;
                        color: #000000;
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    #cv-printable-area {
                        box-shadow: none !important;
                        padding: 0 !important;
                        max-width: 100% !important;
                    }
                </style>
            </head>
            <body class="p-6">
                ${printContent.outerHTML}
                <script>
                    window.onload = function() {
                        window.focus();
                        window.print();
                        window.onafterprint = function() { window.close(); };
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`flex flex-col p-0 gap-0 overflow-hidden bg-slate-200/90 rounded-2xl border border-slate-300 shadow-2xl transition-all duration-200 ${
                    isFullscreen
                        ? 'max-w-[100vw] w-screen h-screen rounded-none'
                        : 'max-w-[1360px] w-[97vw] h-[94vh]'
                }`}
            >
                {/* 1. Header Bar: Title, Theme Segment Tabs, Actions */}
                <DialogHeader className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        {/* Title & Badge */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8F4FD] text-[#1674D1]">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-base sm:text-lg font-extrabold text-[#102B4B]">
                                        Pratinjau Template CV ATS
                                    </DialogTitle>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Sparkles className="w-3 h-3" /> 100% Lolos ATS
                                    </span>
                                </div>
                                <DialogDescription className="text-xs text-slate-500 hidden sm:block">
                                    Format satu-kolom baku Microsoft Word & Google Docs yang aman dipindai mesin ATS.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* 4 Template Segment Tabs */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
                            {CV_TEMPLATES.map((tmpl) => {
                                const isSelected = selectedTemplate === tmpl.id;
                                return (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => setSelectedTemplate(tmpl.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                            isSelected
                                                ? 'bg-white text-[#102B4B] shadow-xs border border-slate-200/80 ring-1 ring-black/5'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                        }`}
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: tmpl.accentColor }}
                                        />
                                        <span>{tmpl.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Top Right Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                            <Button
                                onClick={handleDownloadDoc}
                                className="bg-[#1674D1] hover:bg-[#125EB0] text-white shadow-xs font-semibold text-xs px-3.5 py-2 h-8 flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh Word (.doc)</span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs px-3 py-2 h-8 flex items-center gap-1.5"
                                title="Cetak atau Simpan sebagai PDF"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Cetak PDF</span>
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* 2. Control Toolbar: Specs, Data Toggle & Zoom Controls */}
                <div className="px-4 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
                    {/* Left: Template Specs Pill */}
                    <div className="flex flex-wrap items-center gap-2 text-slate-600">
                        <span className="font-semibold text-slate-800">
                            Spesifikasi {currentMeta.name}:
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Font: {currentMeta.fontFamily.split('(')[0].trim()}
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Header: {currentMeta.headerLayout.split('(')[0].trim()}
                        </span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Margin: {currentMeta.marginText.split('(')[0].trim()}
                        </span>
                        <span className="hidden xl:inline-flex bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Industri: {currentMeta.targetIndustry.split(',').slice(0, 3).join(', ')}...
                        </span>
                    </div>

                    {/* Right: Data Source Toggle & Zoom Tools */}
                    <div className="flex items-center gap-3">
                        {/* Data Switcher */}
                        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setDataSource('profile')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-all ${
                                    dataSource === 'profile'
                                        ? 'bg-[#1674D1] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <UserCheck className="w-3 h-3" />
                                Data Profil Saya
                            </button>
                            <button
                                type="button"
                                onClick={() => setDataSource('sample')}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-semibold transition-all ${
                                    dataSource === 'sample'
                                        ? 'bg-[#1674D1] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <FileCheck className="w-3 h-3" />
                                Template Panduan (Contoh)
                            </button>
                        </div>

                        {/* Interactive Zoom Tools */}
                        <div className="flex items-center bg-white px-1.5 py-1 rounded-lg border border-slate-200 gap-1 text-slate-700">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
                                title="Perkecil Ukuran Tampilan (Zoom Out)"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-[11px] font-bold w-11 text-center text-slate-800">
                                {zoom}%
                            </span>

                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900"
                                title="Perbesar Ukuran Tampilan (Zoom In)"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5" />

                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 text-[10px] font-medium"
                                title="Kembalikan ke Ukuran Standar (115%)"
                            >
                                <RotateCcw className="w-3 h-3" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh'}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-3 h-3" />
                                ) : (
                                    <Maximize2 className="w-3 h-3" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Main Document Viewport (Expansive, dedicated to preview) */}
                <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center items-start bg-slate-300/60 custom-scrollbar">
                    <div className="my-2 transition-all duration-200">
                        {/* Live High-Fidelity Paper Document */}
                        <CvTemplatePreview
                            template={selectedTemplate}
                            data={activeData}
                            zoom={zoom}
                        />
                    </div>
                </div>

                {/* 4. Footer Bar */}
                <div className="px-4 sm:px-6 py-2.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Format baku A4 1-kolom linear
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1 text-slate-600">
                            Kompatibel dengan Word 2016-2024, Microsoft 365, Google Docs & WPS
                        </span>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCopyText}
                            className="border-slate-300 hover:bg-slate-100 text-slate-700 text-xs px-3 py-1.5 h-8 flex items-center gap-1.5"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Teks ATS</span>
                        </Button>
                        <Button
                            onClick={handleDownloadDoc}
                            className="bg-[#1674D1] hover:bg-[#125EB0] text-white shadow-xs font-semibold text-xs px-4 py-1.5 h-8 flex items-center gap-2"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Template Word (.doc)</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
