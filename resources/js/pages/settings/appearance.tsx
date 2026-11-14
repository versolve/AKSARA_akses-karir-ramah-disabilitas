import AppearanceTabs from '@/components/appearance-tabs';
import { edit as editAppearance } from '@/routes/appearance';
import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';

export default function Appearance() {
    return (
        <div className="space-y-6">
            <Head title="Tema & Tampilan - Pengaturan Profabel" />

            {/* Kartu Tema & Tampilan */}
            <div className="space-y-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs sm:p-8">
                <div className="border-b border-[#F1F5F9] pb-4">
                    <h2 className="text-base font-bold text-[#102B4B] sm:text-lg">
                        Preferensi Tema & Tampilan
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
                        Pilih mode antarmuka yang paling nyaman digunakan saat bernavigasi dan mencari kerja di Profabel.
                    </p>
                </div>

                <AppearanceTabs />
            </div>
        </div>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Tampilan',
            href: editAppearance(),
        },
    ],
};
