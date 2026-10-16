import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import type { FormEvent, ReactElement } from 'react';

const ACCESSIBILITY_OPTIONS = [
  { type: 'ramp_access', label: 'Akses Ram / Kursi Roda' },
  { type: 'elevator', label: 'Akses Lift Prioritas' },
  { type: 'accessible_restroom', label: 'Toilet Khusus Disabilitas' },
  { type: 'screen_reader_software', label: 'Dukungan Software Screen Reader' },
  { type: 'sign_language_interpreter', label: 'Juru Bahasa Isyarat' },
  { type: 'written_communication', label: 'Komunikasi Kerja Tertulis (Text-Only)' },
  { type: 'flexible_hours', label: 'Jam Kerja Fleksibel' },
  { type: 'remote_option', label: 'Opsi Kerja Jarak Jauh (Remote)' },
  { type: 'ergonomic_workspace', label: 'Ruang Kerja Ergonomis' },
  { type: 'quiet_space', label: 'Ruang Tenang / Ramah Sensorik' },
];

export default function VacancyCreate(): ReactElement {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    job_type: 'full-time',
    work_model: 'onsite',
    location: '',
    salary_min: '',
    salary_max: '',
    is_salary_public: true,
    experience_level: 'junior',
    requirements: [] as string[],
    skills_required: [] as string[],
    status: 'active',
    deadline: '',
    accessibilities: [] as Array<{ accommodation_type: string; description?: string }>,
  });

  const toggleAccessibility = (type: string): void => {
    const exists = data.accessibilities.some((a) => a.accommodation_type === type);
    if (exists) {
      setData(
        'accessibilities',
        data.accessibilities.filter((a) => a.accommodation_type !== type)
      );
    } else {
      setData('accessibilities', [...data.accessibilities, { accommodation_type: type }]);
    }
  };

  const handleArrayChange = (
    field: 'requirements' | 'skills_required',
    index: number,
    value: string
  ): void => {
    const updated = [...data[field]];
    updated[index] = value;
    setData(field, updated);
  };

  const addArrayItem = (field: 'requirements' | 'skills_required'): void => {
    setData(field, [...data[field], '']);
  };

  const removeArrayItem = (field: 'requirements' | 'skills_required', index: number): void => {
    const updated = data[field].filter((_, i) => i !== index);
    setData(field, updated);
  };

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    post('/company/vacancies');
  };

  return (
    <AppLayout>
      <Head title="Tambah Lowongan Baru" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Tambah Lowongan Pekerjaan</h1>
          <Link href="/company/vacancies" className="text-sm text-teal-600 hover:underline">
            Kembali ke Daftar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <Label htmlFor="title">Judul Posisi Lowongan</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              className="mt-2 block w-full"
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="job_type">Tipe Pekerjaan</Label>
              <select
                id="job_type"
                value={data.job_type}
                onChange={(e) => setData('job_type', e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5 min-h-[44px]"
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Kontrak</option>
                <option value="internship">Magang</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <Label htmlFor="work_model">Model Kerja</Label>
              <select
                id="work_model"
                value={data.work_model}
                onChange={(e) => setData('work_model', e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5 min-h-[44px]"
              >
                <option value="onsite">Onsite (Di Kantor)</option>
                <option value="remote">Remote (Jarak Jauh)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <Label htmlFor="experience_level">Tingkat Pengalaman</Label>
              <select
                id="experience_level"
                value={data.experience_level}
                onChange={(e) => setData('experience_level', e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5 min-h-[44px]"
              >
                <option value="junior">Junior / Pemula</option>
                <option value="mid">Menengah (Mid-Level)</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Manajerial</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Lokasi Kantor / Penempatan</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => setData('location', e.target.value)}
              className="mt-2 block w-full"
              placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
              required
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="salary_min">Gaji Minimum (Rp, Opsional)</Label>
              <Input
                id="salary_min"
                type="number"
                value={data.salary_min}
                onChange={(e) => setData('salary_min', e.target.value)}
                className="mt-2 block w-full"
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Gaji Maksimum (Rp, Opsional)</Label>
              <Input
                id="salary_max"
                type="number"
                value={data.salary_max}
                onChange={(e) => setData('salary_max', e.target.value)}
                className="mt-2 block w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Deskripsi Pekerjaan & Tanggung Jawab</Label>
            <textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={5}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-3 focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
              required
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Requirements list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Persyaratan Umum (Opsional)</Label>
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                + Tambah Persyaratan
              </button>
            </div>
            {data.requirements.map((req, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={req}
                  onChange={(e) => handleArrayChange('requirements', i, e.target.value)}
                  placeholder={`Persyaratan ${i + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeArrayItem('requirements', i)}
                  className="text-xs text-rose-600"
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>

          {/* Skills list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Keterampilan yang Dibutuhkan (Opsional)</Label>
              <button
                type="button"
                onClick={() => addArrayItem('skills_required')}
                className="text-xs font-semibold text-teal-600 hover:underline"
              >
                + Tambah Keterampilan
              </button>
            </div>
            {data.skills_required.map((skill, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  value={skill}
                  onChange={(e) => handleArrayChange('skills_required', i, e.target.value)}
                  placeholder={`Keahlian ${i + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeArrayItem('skills_required', i)}
                  className="text-xs text-rose-600"
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>

          {/* Accessibility Checklist */}
          <fieldset className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <legend className="font-semibold text-teal-900 px-2">
              Fasilitas & Dukungan Aksesibilitas Tempat Kerja
            </legend>
            <p className="mb-3 text-xs text-slate-600">
              Pilih fasilitas yang telah disediakan perusahaan untuk mendukung pekerja disabilitas pada posisi ini.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.type}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-teal-100 bg-white p-3 hover:bg-teal-50 min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={data.accessibilities.some((a) => a.accommodation_type === opt.type)}
                    onChange={() => toggleAccessibility(opt.type)}
                    className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-800">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="status">Status Lowongan</Label>
              <select
                id="status"
                value={data.status}
                onChange={(e) => setData('status', e.target.value as 'draft' | 'active' | 'closed')}
                className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5 min-h-[44px]"
              >
                <option value="active">Aktif (Dapat Dilamar)</option>
                <option value="draft">Draf (Disimpan Dulu)</option>
                <option value="closed">Ditutup</option>
              </select>
            </div>
            <div>
              <Label htmlFor="deadline">Batas Akhir Lamaran (Opsional)</Label>
              <Input
                id="deadline"
                type="date"
                value={data.deadline}
                onChange={(e) => setData('deadline', e.target.value)}
                className="mt-2 block w-full min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/company/vacancies"
              className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 min-h-[44px]"
            >
              Batal
            </Link>
            <Button
              disabled={processing}
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] px-6"
            >
              {processing ? 'Menyimpan...' : 'Simpan & Publikasikan'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
