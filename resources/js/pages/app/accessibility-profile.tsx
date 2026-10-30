import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Accessibility,
  CheckCircle2,
  HeartHandshake,
  Info,
  Save,
  Sparkles,
} from 'lucide-react';
import type { FormEvent, ReactElement } from 'react';

interface DisabilityOptions {
  id: string;
  label: string;
  description: string;
}

const DISABILITY_OPTIONS: DisabilityOptions[] = [
  { id: 'fisik', label: 'Disabilitas Fisik / Motorik', description: 'Pengguna kursi roda, kruk, atau kendala mobilitas fisik.' },
  { id: 'netra', label: 'Disabilitas Netra / Penglihatan', description: 'Low vision atau total blind yang memerlukan pembaca layar / font besar.' },
  { id: 'rungu', label: 'Disabilitas Rungu / Pendengaran', description: 'Tuli atau hard of hearing yang mengutamakan komunikasi visual / tertulis.' },
  { id: 'wicara', label: 'Disabilitas Wicara', description: 'Keterbatasan bicara yang mengutamakan teks dan gestur.' },
  { id: 'intelektual', label: 'Disabilitas Intelektual / Mental', description: 'Memerlukan instruksi kerja terstruktur dan lingkungan ramah sensorik.' },
];

interface AccommodationOptions {
  id: string;
  label: string;
  category: string;
}

const ACCOMMODATION_OPTIONS: AccommodationOptions[] = [
  { id: 'screen_reader', label: 'Dukungan Software Screen Reader (NVDA/JAWS)', category: 'Teknologi' },
  { id: 'ramp', label: 'Akses Ram Landai / Kursi Roda', category: 'Fisik' },
  { id: 'lift', label: 'Akses Lift Prioritas Gedung', category: 'Fisik' },
  { id: 'komunikasi_tertulis', label: 'Komunikasi Kerja Tertulis (Text-Only)', category: 'Komunikasi' },
  { id: 'remote_work', label: 'Opsi Kerja Jarak Jauh (100% Remote WFH)', category: 'Fleksibilitas' },
  { id: 'flexible_hours', label: 'Jam Kerja Fleksibel', category: 'Fleksibilitas' },
];

interface AccessibilityData {
  disability_types: string[];
  accommodations_needed: string[];
  notes: string;
}

interface Props {
  accessibility: Partial<AccessibilityData>;
}

export default function AccessibilityProfile({ accessibility }: Props): ReactElement {
  const { data, setData, post, processing, errors } = useForm<AccessibilityData>({
    disability_types: accessibility.disability_types ?? [],
    accommodations_needed: accessibility.accommodations_needed ?? [],
    notes: accessibility.notes ?? '',
  });

  const toggleArrayItem = (
    list: string[],
    item: string,
    updateFn: (updated: string[]) => void
  ): void => {
    if (list.includes(item)) {
      updateFn(list.filter((i) => i !== item));
    } else {
      updateFn([...list, item]);
    }
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    post('/app/accessibility-profile');
  };

  return (
    <AppLayout>
      <Head title="Profil Kebutuhan Aksesibilitas - Profabel" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 mb-1">
              <Accessibility className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Inklusivitas & Kesetaraan</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Profil Kebutuhan Aksesibilitas
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Informasi ini akan dicocokkan otomatis oleh AI dengan fasilitas yang disediakan mitra perusahaan.
            </p>
          </div>
          <Link
            href="/app/profile"
            className="text-xs font-semibold text-emerald-700 hover:underline min-h-[44px] flex items-center"
          >
            ← Kembali ke Profil Umum
          </Link>
        </div>

        {/* Info Box */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900">
          <Info className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Data kebutuhan aksesibilitas Anda digunakan secara etis untuk membantu mencarikan lingkungan kerja yang kondusif. Perusahaan mitra hanya dapat melihat data ini pada berkas lamaran yang Anda kirimkan secara sukarela.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {/* Disability Types Section */}
          <fieldset>
            <legend className="text-sm font-bold text-slate-900 mb-1">
              1. Ragam Disabilitas (Bisa pilih lebih dari satu)
            </legend>
            <p className="text-xs text-slate-500 mb-3">
              Pilih kategori yang paling menggambarkan kondisi Anda untuk penyesuaian fasilitas kerja.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DISABILITY_OPTIONS.map((opt) => {
                const isSelected = data.disability_types.includes(opt.id);

                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer flex-col rounded-xl border p-4 transition min-h-[44px] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleArrayItem(
                            data.disability_types,
                            opt.id,
                            (vals) => setData('disability_types', vals)
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                      {opt.description}
                    </p>
                  </label>
                );
              })}
            </div>
            {errors.disability_types && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.disability_types}</p>
            )}
          </fieldset>

          {/* Accommodations Needed Section */}
          <fieldset className="border-t border-slate-100 pt-6">
            <legend className="text-sm font-bold text-slate-900 mb-1">
              2. Fasilitas & Akomodasi Tempat Kerja yang Anda Butuhkan
            </legend>
            <p className="text-xs text-slate-500 mb-3">
              Fasilitas yang wajib atau sangat membantu produktivitas Anda dalam bekerja sehari-hari.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ACCOMMODATION_OPTIONS.map((opt) => {
                const isSelected = data.accommodations_needed.includes(opt.id);

                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition min-h-[44px] ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleArrayItem(
                          data.accommodations_needed,
                          opt.id,
                          (vals) => setData('accommodations_needed', vals)
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 ml-2 shrink-0"
                    />
                  </label>
                );
              })}
            </div>
            {errors.accommodations_needed && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.accommodations_needed}</p>
            )}
          </fieldset>

          {/* Notes Section */}
          <div className="border-t border-slate-100 pt-6">
            <Label htmlFor="notes" className="text-sm font-bold text-slate-900">
              3. Catatan Khusus Mengenai Penyesuaian Tempat Kerja
            </Label>
            <p className="text-xs text-slate-500 mb-2">
              Contoh: spesifikasi kursi ergonomis, pencahayaan, toleransi istirahat berkala, atau aplikasi pendukung.
            </p>
            <textarea
              id="notes"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              rows={3}
              placeholder="Tuliskan catatan detail fasilitas jika ada..."
              className="block w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {errors.notes && <p className="mt-1 text-xs text-rose-600">{errors.notes}</p>}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              disabled={processing}
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] px-6 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {processing ? 'Menyimpan...' : 'Simpan Profil Aksesibilitas'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
