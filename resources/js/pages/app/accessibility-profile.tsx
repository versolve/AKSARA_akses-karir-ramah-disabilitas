import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ReactElement } from 'react';

interface DisabilityOptions {
  id: string;
  label: string;
}

const DISABILITY_OPTIONS: DisabilityOptions[] = [
  { id: 'fisik', label: 'Disabilitas Fisik / Motorik' },
  { id: 'netra', label: 'Disabilitas Netra / Penglihatan' },
  { id: 'rungu', label: 'Disabilitas Rungu / Pendengaran' },
  { id: 'wicara', label: 'Disabilitas Wicara' },
  { id: 'intelektual', label: 'Disabilitas Intelektual / Mental' },
];

interface AccommodationOptions {
  id: string;
  label: string;
}

const ACCOMMODATION_OPTIONS: AccommodationOptions[] = [
  { id: 'screen_reader', label: 'Dukungan Screen Reader / Audio' },
  { id: 'ramp', label: 'Akses Ram / Kursi Roda' },
  { id: 'komunikasi_tertulis', label: 'Komunikasi Kerja Tertulis (Text-Only)' },
  { id: 'remote_work', label: 'Opsi Kerja Jarak Jauh (Remote)' },
  { id: 'flexible_hours', label: 'Jam Kerja Fleksibel' },
  { id: 'lift', label: 'Akses Lift Prioritas' },
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
      <Head title="Profil Aksesibilitas" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Profil Kebutuhan Aksesibilitas
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          Informasi ini akan dicocokkan oleh sistem dengan fasilitas tempat kerja yang
          disediakan perusahaan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          {/* Disability Types */}
          <fieldset>
            <legend className="text-base font-semibold text-slate-900">Ragam Disabilitas</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DISABILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={data.disability_types.includes(opt.id)}
                    onChange={() =>
                      toggleArrayItem(
                        data.disability_types,
                        opt.id,
                        (vals) => setData('disability_types', vals)
                      )
                    }
                    className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.disability_types && (
              <p className="mt-2 text-sm text-red-600">{errors.disability_types}</p>
            )}
          </fieldset>

          {/* Accommodations Needed */}
          <fieldset>
            <legend className="text-base font-semibold text-slate-900">
              Akomodasi Tempat Kerja yang Dibutuhkan
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ACCOMMODATION_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={data.accommodations_needed.includes(opt.id)}
                    onChange={() =>
                      toggleArrayItem(
                        data.accommodations_needed,
                        opt.id,
                        (vals) => setData('accommodations_needed', vals)
                      )
                    }
                    className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.accommodations_needed && (
              <p className="mt-2 text-sm text-red-600">{errors.accommodations_needed}</p>
            )}
          </fieldset>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan Tambahan Mengenai Fasilitas yang Dibutuhkan</Label>
            <textarea
              id="notes"
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              rows={3}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            />
            {errors.notes && <p className="mt-2 text-sm text-red-600">{errors.notes}</p>}
          </div>

          <Button disabled={processing} type="submit" style={{ minHeight: '44px' }}>
            Simpan Profil Aksesibilitas
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
