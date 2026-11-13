import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import { useInitials } from '@/hooks/use-initials';
import AdminLayout from '@/layouts/admin-layout';
import type { User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  Headphones,
  Image,
  Info,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useRef, useState, type ReactElement } from 'react';

export interface SystemSettings {
  app_name: string;
  app_description: string;
  app_version: string;
  operational_year: string;
  official_email: string;
  contact_phone: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  theme_color: string;
  maintenance_mode: boolean;
  user_registration: boolean;
  email_verification: boolean;
  show_dashboard_stats: boolean;
  languages: {
    id: boolean;
    en: boolean;
    ar: boolean;
    ja: boolean;
  };
  timezone: string;
  default_location: string;
  last_backup_at: string;
  last_backup_status: string;
  support_email: string;
  support_whatsapp: string;
  support_operational_hours: string;
}

interface Props {
  settings: SystemSettings;
  activeTab?: string;
  mustVerifyEmail?: boolean;
  status?: string;
  flash?: {
    success?: string | null;
    error?: string | null;
  };
}

/**
 * Accessible Toggle Switch Component matching Reference UI.
 */
function Switch({
  checked,
  onCheckedChange,
  id,
  ariaLabel,
  disabled = false,
}: {
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  id?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769E0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-[#1769E0]' : 'bg-slate-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminSettingsIndex({
  settings: initialSettings,
  activeTab: initialTab = 'system',
}: Props): ReactElement {
  const page = usePage();
  const authUser = (page.props.auth as { user: User }).user;
  const getInitials = useInitials();
  const { appearance, updateAppearance } = useAppearance();

  const [tab, setTab] = useState<string>(initialTab);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Hidden file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [showManageColorModal, setShowManageColorModal] = useState(false);
  const [showManageLanguageModal, setShowManageLanguageModal] = useState(false);
  const [showBackupHistoryModal, setShowBackupHistoryModal] = useState(false);
  const [customColorInput, setCustomColorInput] = useState(settings.theme_color || '#1769E0');

  // Profile tab states
  const [profileName, setProfileName] = useState(authUser.name || '');
  const [profileEmail, setProfileEmail] = useState(authUser.email || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Password / Security tab states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Color options
  const colorOptions = [
    { name: 'Biru Utama', hex: '#1769E0' },
    { name: 'Toska Inklusif', hex: '#0D9488' },
    { name: 'Ungu Elegan', hex: '#7C3AED' },
    { name: 'Oranye Hangat', hex: '#EA580C' },
    { name: 'Abu Modern', hex: '#64748B' },
  ];

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Save system settings
  const handleSaveSystemSettings = (partialData?: Partial<SystemSettings>) => {
    setIsSaving(true);
    const dataToSave = { ...settings, ...(partialData || {}) };

    router.post('/admin/settings', dataToSave, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSaving(false);
        showNotification('Perubahan pengaturan sistem berhasil disimpan.');
      },
      onError: () => {
        setIsSaving(false);
      },
    });
  };

  // Upload Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    router.post('/admin/settings', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        showNotification('Logo platform berhasil diperbarui.');
      },
    });
  };

  // Upload Favicon
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('favicon', file);

    router.post('/admin/settings', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        showNotification('Favicon platform berhasil diperbarui.');
      },
    });
  };

  // Trigger Backup
  const handleTriggerBackup = () => {
    setIsSaving(true);
    router.post(
      '/admin/settings/backup',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          setIsSaving(false);
          const nowFormatted = new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          setSettings((prev) => ({
            ...prev,
            last_backup_at: nowFormatted,
            last_backup_status: 'Berhasil',
          }));
          showNotification('Pencadangan data sistem berhasil diselesaikan.');
        },
        onError: () => {
          setIsSaving(false);
        },
      }
    );
  };

  // Save Admin Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    router.patch(
      '/admin/settings/admin-profile',
      { name: profileName, email: profileEmail },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setIsUpdatingProfile(false);
          showNotification('Profil admin berhasil diperbarui.');
        },
        onError: () => {
          setIsUpdatingProfile(false);
        },
      }
    );
  };

  // Upload Avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    router.post('/profile/avatar', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        showNotification('Foto profil admin berhasil diperbarui.');
      },
    });
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    router.delete('/profile/avatar', {
      preserveScroll: true,
      onSuccess: () => {
        showNotification('Foto profil admin berhasil dihapus.');
      },
    });
  };

  // Save Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsUpdatingPassword(true);
    router.put(
      '/admin/settings/admin-password',
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setIsUpdatingPassword(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          showNotification('Password akun berhasil diperbarui.');
        },
        onError: (errors) => {
          setIsUpdatingPassword(false);
          if (errors.current_password) {
            setPasswordError(errors.current_password as string);
          } else if (errors.password) {
            setPasswordError(errors.password as string);
          } else {
            setPasswordError('Gagal memperbarui password. Silakan periksa kembali data Anda.');
          }
        },
      }
    );
  };

  return (
    <AdminLayout>
      <Head title="Pengaturan Sistem - AKSARA" />

      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="ml-2 rounded p-1 text-emerald-600 hover:bg-emerald-100"
            aria-label="Tutup notifikasi"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Content with comfortable padding from sidebar */}
      <div className="min-h-screen bg-[#F8FBFE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#102B4B] sm:text-3xl">Pengaturan</h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Kelola konfigurasi sistem AKSARA.</p>
          </div>

          {/* Tabs */}
          <nav
            className="flex border-b border-slate-200 text-xs font-bold"
            aria-label="Navigasi Tab Pengaturan"
          >
        <button
          type="button"
          onClick={() => setTab('system')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            tab === 'system'
              ? 'border-[#1769E0] text-[#1769E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Konfigurasi Sistem
        </button>
        <button
          type="button"
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            tab === 'profile'
              ? 'border-[#1769E0] text-[#1769E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          Profil Admin
        </button>
        <button
          type="button"
          onClick={() => setTab('security')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            tab === 'security'
              ? 'border-[#1769E0] text-[#1769E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Keamanan Akun
        </button>
        <button
          type="button"
          onClick={() => setTab('appearance')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 transition ${
            tab === 'appearance'
              ? 'border-[#1769E0] text-[#1769E0]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Palette className="h-4 w-4" />
          Tampilan
        </button>
      </nav>

      {/* TAB 1: KONFIGURASI SISTEM (Matches Reference UI 100%) */}
      {tab === 'system' && (
        <div className="space-y-6">
          {/* TOP ROW: 3 Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Card 1: Informasi Aplikasi */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Informasi Aplikasi</h2>
                    <p className="text-[11px] text-slate-400">Atur informasi dasar platform.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-xs">
                  <div>
                    <Label htmlFor="app_name" className="text-xs font-semibold text-slate-700">
                      Nama Platform
                    </Label>
                    <Input
                      id="app_name"
                      value={settings.app_name}
                      onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="Nama Platform"
                    />
                  </div>

                  <div>
                    <Label htmlFor="app_desc" className="text-xs font-semibold text-slate-700">
                      Deskripsi Singkat
                    </Label>
                    <textarea
                      id="app_desc"
                      rows={3}
                      maxLength={200}
                      value={settings.app_description}
                      onChange={(e) => setSettings({ ...settings, app_description: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                      placeholder="Deskripsi singkat platform"
                    />
                    <div className="text-right text-[11px] text-slate-400">
                      {settings.app_description?.length || 0}/200
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="app_ver" className="text-xs font-semibold text-slate-700">
                      Versi Aplikasi
                    </Label>
                    <Input
                      id="app_ver"
                      value={settings.app_version}
                      onChange={(e) => setSettings({ ...settings, app_version: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="v1.0.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="op_year" className="text-xs font-semibold text-slate-700">
                      Tahun Operasional
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="op_year"
                        value={settings.operational_year}
                        onChange={(e) =>
                          setSettings({ ...settings, operational_year: e.target.value })
                        }
                        className="h-10 pr-9 rounded-xl text-xs"
                        placeholder="2024"
                      />
                      <Calendar className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="off_email" className="text-xs font-semibold text-slate-700">
                      Email Resmi
                    </Label>
                    <Input
                      id="off_email"
                      type="email"
                      value={settings.official_email}
                      onChange={(e) => setSettings({ ...settings, official_email: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="info@aksara.id"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_phone" className="text-xs font-semibold text-slate-700">
                      Nomor Kontak
                    </Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="+62 21 1234 5678"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleSaveSystemSettings()}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-[#1769E0] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1254B5]"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </section>

            {/* Card 2: Logo & Identitas */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Image className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Logo & Identitas</h2>
                    <p className="text-[11px] text-slate-400">
                      Kelola logo dan identitas visual platform.
                    </p>
                  </div>
                </div>

                {/* Logo Box */}
                <div className="mt-5">
                  <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-slate-100 bg-[#FBFDFF] p-6">
                    <img
                      src={settings.logo_url || '/images/logos/logo_biru.svg'}
                      alt="Logo Platform"
                      className="max-h-14 w-auto object-contain"
                    />
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <div className="mt-4 text-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="mx-auto flex items-center gap-2 rounded-xl border-[#1769E0] px-4 py-2 text-xs font-bold text-[#1769E0] hover:bg-blue-50"
                    >
                      <Upload className="h-4 w-4" />
                      Ubah Logo
                    </Button>
                    <p className="mt-2 text-[11px] text-slate-400">Format: PNG, JPG (maks. 2MB)</p>
                    <p className="text-[11px] text-slate-400">Rekomendasi ukuran: 300 x 100 px</p>
                  </div>
                </div>

                {/* Favicon Box */}
                <div className="mt-7 border-t border-slate-100 pt-5">
                  <span className="mb-2 block text-xs font-semibold text-slate-700">Favicon</span>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-[#FBFDFF] p-2">
                      <img
                        src="/images/logos/logo_biru.svg"
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                    </div>

                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/x-icon,image/svg+xml"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl border-[#1769E0] px-3.5 py-1.5 text-xs font-bold text-[#1769E0] hover:bg-blue-50"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Ubah Favicon
                      </Button>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Format: PNG, JPG (maks. 1MB)
                      </p>
                      <p className="text-[11px] text-slate-400">Rekomendasi ukuran: 32 x 32 px</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Column 3: Warna Tema & Pengaturan Umum */}
            <div className="space-y-6 lg:col-span-4">
              {/* Card 3A: Warna Tema */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Warna Tema</h2>
                    <p className="text-[11px] text-slate-400">Atur warna utama platform.</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {colorOptions.map((c) => {
                      const isSelected = settings.theme_color?.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => {
                            setSettings({ ...settings, theme_color: c.hex });
                            handleSaveSystemSettings({ theme_color: c.hex });
                          }}
                          aria-label={`Pilih warna ${c.name}`}
                          className={`h-7 w-7 rounded-full transition transform hover:scale-110 ${
                            isSelected ? 'ring-2 ring-[#1769E0] ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowManageColorModal(true)}
                    className="text-xs font-bold text-[#1769E0] hover:underline"
                  >
                    Kelola Warna
                  </button>
                </div>

                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3 text-xs text-slate-600">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1769E0]" />
                  <span>Warna tema akan digunakan pada tampilan dashboard dan halaman publik.</span>
                </div>
              </section>

              {/* Card 3B: Pengaturan Umum */}
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Pengaturan Umum</h2>
                    <p className="text-[11px] text-slate-400">Atur preferensi sistem secara umum.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block font-bold text-[#102B4B]">Mode Maintenance</span>
                      <span className="block text-[11px] text-slate-400">
                        Platform akan tidak dapat diakses sementara.
                      </span>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(val) => {
                        setSettings({ ...settings, maintenance_mode: val });
                        handleSaveSystemSettings({ maintenance_mode: val });
                      }}
                      ariaLabel="Toggle Mode Maintenance"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block font-bold text-[#102B4B]">
                        Aktifkan Pendaftaran Pengguna
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        Pengguna dapat membuat akun baru.
                      </span>
                    </div>
                    <Switch
                      checked={settings.user_registration}
                      onCheckedChange={(val) => {
                        setSettings({ ...settings, user_registration: val });
                        handleSaveSystemSettings({ user_registration: val });
                      }}
                      ariaLabel="Toggle Pendaftaran Pengguna"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block font-bold text-[#102B4B]">Verifikasi Email</span>
                      <span className="block text-[11px] text-slate-400">
                        Pengguna harus memverifikasi email saat mendaftar.
                      </span>
                    </div>
                    <Switch
                      checked={settings.email_verification}
                      onCheckedChange={(val) => {
                        setSettings({ ...settings, email_verification: val });
                        handleSaveSystemSettings({ email_verification: val });
                      }}
                      ariaLabel="Toggle Verifikasi Email"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block font-bold text-[#102B4B]">
                        Tampilkan Statistik di Dashboard
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        Menampilkan ringkasan data pada dashboard.
                      </span>
                    </div>
                    <Switch
                      checked={settings.show_dashboard_stats}
                      onCheckedChange={(val) => {
                        setSettings({ ...settings, show_dashboard_stats: val });
                        handleSaveSystemSettings({ show_dashboard_stats: val });
                      }}
                      ariaLabel="Toggle Statistik Dashboard"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* BOTTOM ROW: 4 Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 4: Pengaturan Bahasa */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Pengaturan Bahasa</h2>
                    <p className="text-[11px] text-slate-400">
                      Atur bahasa yang tersedia di platform.
                    </p>
                  </div>
                </div>

                <div className="my-5 space-y-3.5 text-xs">
                  {/* ID */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="h-5 w-5 shrink-0 rounded-full border border-slate-200 shadow-xs"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <clipPath id="flag-indonesia-circle">
                          <circle cx="10" cy="10" r="10" />
                        </clipPath>
                        <g clipPath="url(#flag-indonesia-circle)">
                          <rect width="20" height="10" fill="#E70011" />
                          <rect y="10" width="20" height="10" fill="#FFFFFF" />
                        </g>
                      </svg>
                      <span className="font-semibold text-slate-800">Bahasa Indonesia</span>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1769E0]">
                      Aktif
                    </span>
                  </div>

                  {/* EN */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-[#00247D] text-[9px] font-bold text-white">
                        EN
                      </span>
                      <span className="font-semibold text-slate-800">English</span>
                    </div>
                    <Switch
                      checked={Boolean(settings.languages?.en)}
                      onCheckedChange={(val) => {
                        const updated = { ...settings.languages, en: val };
                        setSettings({ ...settings, languages: updated });
                        handleSaveSystemSettings({ languages: updated });
                      }}
                      ariaLabel="Toggle English"
                    />
                  </div>

                  {/* AR */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-[#006C35] text-[9px] font-bold text-white">
                        AR
                      </span>
                      <span className="font-semibold text-slate-800">Bahasa Arab</span>
                    </div>
                    <Switch
                      checked={Boolean(settings.languages?.ar)}
                      onCheckedChange={(val) => {
                        const updated = { ...settings.languages, ar: val };
                        setSettings({ ...settings, languages: updated });
                        handleSaveSystemSettings({ languages: updated });
                      }}
                      ariaLabel="Toggle Bahasa Arab"
                    />
                  </div>

                  {/* JA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      </span>
                      <span className="font-semibold text-slate-800">Bahasa Jepang</span>
                    </div>
                    <Switch
                      checked={Boolean(settings.languages?.ja)}
                      onCheckedChange={(val) => {
                        const updated = { ...settings.languages, ja: val };
                        setSettings({ ...settings, languages: updated });
                        handleSaveSystemSettings({ languages: updated });
                      }}
                      ariaLabel="Toggle Bahasa Jepang"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManageLanguageModal(true)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border-[#1769E0] py-2 text-xs font-bold text-[#1769E0] hover:bg-blue-50"
              >
                <Settings className="h-3.5 w-3.5" />
                Kelola Bahasa
              </Button>
            </section>

            {/* Card 5: Lokasi & Zona Waktu */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Lokasi & Zona Waktu</h2>
                    <p className="text-[11px] text-slate-400">Atur zona waktu dan lokasi default.</p>
                  </div>
                </div>

                <div className="my-5 space-y-4 text-xs">
                  <div>
                    <Label htmlFor="timezone_select" className="text-xs font-semibold text-slate-700">
                      Zona Waktu
                    </Label>
                    <select
                      id="timezone_select"
                      value={settings.timezone}
                      onChange={(e) => {
                        setSettings({ ...settings, timezone: e.target.value });
                        handleSaveSystemSettings({ timezone: e.target.value });
                      }}
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                    >
                      <option value="WIB (GMT+7)">WIB (GMT+7)</option>
                      <option value="WITA (GMT+8)">WITA (GMT+8)</option>
                      <option value="WIT (GMT+9)">WIT (GMT+9)</option>
                      <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="loc_select" className="text-xs font-semibold text-slate-700">
                      Lokasi Default
                    </Label>
                    <select
                      id="loc_select"
                      value={settings.default_location}
                      onChange={(e) => {
                        setSettings({ ...settings, default_location: e.target.value });
                        handleSaveSystemSettings({ default_location: e.target.value });
                      }}
                      className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:border-[#1769E0] focus:outline-none focus:ring-1 focus:ring-[#1769E0]"
                    >
                      <option value="Indonesia">Indonesia</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapura">Singapura</option>
                      <option value="Global">Global</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3 text-xs text-slate-600">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1769E0]" />
                <span>Zona waktu akan digunakan untuk penjadwalan notifikasi dan laporan.</span>
              </div>
            </section>

            {/* Card 6: Backup Data */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Backup Data</h2>
                    <p className="text-[11px] text-slate-400">Kelola pencadangan data sistem.</p>
                  </div>
                </div>

                <div className="my-5 text-xs">
                  <span className="block font-medium text-slate-500">Terakhir Backup</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {settings.last_backup_at || '12 Jun 2024, 08:30'}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {settings.last_backup_status || 'Berhasil'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <Button
                  type="button"
                  onClick={handleTriggerBackup}
                  disabled={isSaving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769E0] py-2.5 text-xs font-bold text-white hover:bg-[#1254B5]"
                >
                  <Download className="h-4 w-4" />
                  Backup Sekarang
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBackupHistoryModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Clock className="h-4 w-4 text-slate-500" />
                  Riwayat Backup
                </Button>
              </div>
            </section>

            {/* Card 7: Informasi Kontak Support */}
            <section className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#102B4B]">Informasi Kontak Support</h2>
                    <p className="text-[11px] text-slate-400">
                      Kelola informasi kontak tim dukungan.
                    </p>
                  </div>
                </div>

                <div className="my-5 space-y-3.5 text-xs">
                  <div>
                    <Label htmlFor="sup_email" className="text-xs font-semibold text-slate-700">
                      Email Support
                    </Label>
                    <Input
                      id="sup_email"
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="support@aksara.id"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sup_wa" className="text-xs font-semibold text-slate-700">
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="sup_wa"
                      value={settings.support_whatsapp}
                      onChange={(e) =>
                        setSettings({ ...settings, support_whatsapp: e.target.value })
                      }
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="+62 812 3456 7890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sup_hours" className="text-xs font-semibold text-slate-700">
                      Jam Operasional
                    </Label>
                    <Input
                      id="sup_hours"
                      value={settings.support_operational_hours}
                      onChange={(e) =>
                        setSettings({ ...settings, support_operational_hours: e.target.value })
                      }
                      className="mt-1.5 h-10 rounded-xl text-xs"
                      placeholder="Senin - Jumat, 08:00 - 17:00"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSaveSystemSettings()}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl border-[#1769E0] px-4 py-2 text-xs font-bold text-[#1769E0] hover:bg-blue-50"
                >
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIL ADMIN (Existing settings styled to match Reference) */}
      {tab === 'profile' && (
        <div className="max-w-3xl space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102B4B]">Profil Administrator</h2>
                <p className="text-[11px] text-slate-400">
                  Perbarui nama lengkap, email, dan foto profil akun administrator Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5 text-xs">
              {/* Avatar Section */}
              <div className="flex items-center gap-5 pb-2">
                <div className="relative">
                  {authUser.avatar ? (
                    <img
                      src={authUser.avatar}
                      alt={authUser.name}
                      className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#101B4D] text-lg font-bold text-white shadow-sm">
                      {getInitials(authUser.name)}
                    </div>
                  )}
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => avatarInputRef.current?.click()}
                      className="rounded-xl border-[#1769E0] px-3.5 py-1.5 text-xs font-bold text-[#1769E0] hover:bg-blue-50"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      Ubah Foto
                    </Button>
                    {authUser.avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveAvatar}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Format JPG, PNG, atau WEBP. Rekomendasi 300 x 300 px.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="prof_name" className="text-xs font-semibold text-slate-700">
                  Nama Lengkap
                </Label>
                <Input
                  id="prof_name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="mt-1.5 h-10 rounded-xl text-xs"
                />
              </div>

              <div>
                <Label htmlFor="prof_email" className="text-xs font-semibold text-slate-700">
                  Alamat Email
                </Label>
                <Input
                  id="prof_email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  required
                  className="mt-1.5 h-10 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 rounded-xl bg-[#1769E0] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1254B5]"
                >
                  <Save className="h-4 w-4" />
                  {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-rose-50 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-900">Hapus Akun</h2>
                <p className="text-[11px] text-slate-400">
                  Tindakan ini permanen dan akan menghapus akun administrator Anda.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Pastikan Anda telah memiliki akun cadangan administrator lainnya sebelum menghapus
                akun ini.
              </span>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteAccountModal(true)}
                className="shrink-0 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
              >
                Hapus Akun
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: KEAMANAN AKUN (Password & 2FA styled to match Reference) */}
      {tab === 'security' && (
        <div className="max-w-3xl space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102B4B]">Ubah Password</h2>
                <p className="text-[11px] text-slate-400">
                  Pastikan akun Anda menggunakan kombinasi password yang kuat dan aman.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4 text-xs">
              {passwordError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <Label htmlFor="curr_pass" className="text-xs font-semibold text-slate-700">
                  Password Saat Ini
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="curr_pass"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-10 pr-10 rounded-xl text-xs"
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    aria-label={showPasswords ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new_pass" className="text-xs font-semibold text-slate-700">
                  Password Baru
                </Label>
                <Input
                  id="new_pass"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-1.5 h-10 rounded-xl text-xs"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div>
                <Label htmlFor="confirm_pass" className="text-xs font-semibold text-slate-700">
                  Konfirmasi Password Baru
                </Label>
                <Input
                  id="confirm_pass"
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1.5 h-10 rounded-xl text-xs"
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2 rounded-xl bg-[#1769E0] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1254B5]"
                >
                  <Lock className="h-4 w-4" />
                  {isUpdatingPassword ? 'Memproses...' : 'Perbarui Password'}
                </Button>
              </div>
            </form>
          </section>

          {/* 2FA Card */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102B4B]">
                  Autentikasi Dua Langkah (2FA)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Tambahkan lapisan keamanan ekstra untuk akun Anda saat masuk.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs">
              <div>
                <span className="block font-bold text-[#102B4B]">Status 2FA</span>
                <span className="text-slate-500">
                  {authUser.two_factor_confirmed_at ? 'Aktif terpasang' : 'Belum diaktifkan'}
                </span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  authUser.two_factor_confirmed_at
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {authUser.two_factor_confirmed_at ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: TAMPILAN (Appearance styled to match Reference) */}
      {tab === 'appearance' && (
        <div className="max-w-3xl space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0]">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#102B4B]">Tema Tampilan</h2>
                <p className="text-[11px] text-slate-400">
                  Pilih mode tampilan antarmuka AKSARA yang paling nyaman untuk Anda.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              {/* Light */}
              <button
                type="button"
                onClick={() => {
                  updateAppearance('light');
                  showNotification('Tema terang berhasil diaktifkan.');
                }}
                className={`flex flex-col items-center rounded-2xl border p-5 text-center transition ${
                  appearance === 'light'
                    ? 'border-[#1769E0] bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 mb-3">
                  <Sun className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#102B4B]">Terang (Light)</span>
                <span className="mt-1 text-[11px] text-slate-500">Tampilan bersih dan kontras</span>
                {appearance === 'light' && (
                  <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1769E0]">
                    <Check className="h-3.5 w-3.5" /> Aktif
                  </span>
                )}
              </button>

              {/* Dark */}
              <button
                type="button"
                onClick={() => {
                  updateAppearance('dark');
                  showNotification('Tema gelap berhasil diaktifkan.');
                }}
                className={`flex flex-col items-center rounded-2xl border p-5 text-center transition ${
                  appearance === 'dark'
                    ? 'border-[#1769E0] bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-slate-100 mb-3">
                  <Moon className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#102B4B]">Gelap (Dark)</span>
                <span className="mt-1 text-[11px] text-slate-500">Nyaman di mata saat malam</span>
                {appearance === 'dark' && (
                  <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1769E0]">
                    <Check className="h-3.5 w-3.5" /> Aktif
                  </span>
                )}
              </button>

              {/* System */}
              <button
                type="button"
                onClick={() => {
                  updateAppearance('system');
                  showNotification('Tema otomatis mengikuti sistem.');
                }}
                className={`flex flex-col items-center rounded-2xl border p-5 text-center transition ${
                  appearance === 'system'
                    ? 'border-[#1769E0] bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1769E0] mb-3">
                  <Monitor className="h-6 w-6" />
                </div>
                <span className="font-bold text-[#102B4B]">Ikuti Sistem</span>
                <span className="mt-1 text-[11px] text-slate-500">Sesuai pengaturan perangkat</span>
                {appearance === 'system' && (
                  <span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#1769E0]">
                    <Check className="h-3.5 w-3.5" /> Aktif
                  </span>
                )}
              </button>
            </div>
          </section>
        </div>
      )}
        </div>
      </div>

      {/* MODAL: KELOLA WARNA */}
      <Dialog open={showManageColorModal} onOpenChange={setShowManageColorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">Kelola Warna Tema</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pilih warna preset atau masukkan kode HEX warna kustom untuk branding platform AKSARA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Warna Preset</Label>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setCustomColorInput(c.hex)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-slate-50"
                  >
                    <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span className="font-medium text-slate-700">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Label htmlFor="custom_hex" className="text-xs font-semibold text-slate-700">
                Kode Warna HEX Kustom
              </Label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 p-0.5"
                />
                <Input
                  id="custom_hex"
                  value={customColorInput}
                  onChange={(e) => setCustomColorInput(e.target.value)}
                  className="h-10 rounded-xl text-xs font-mono uppercase"
                  placeholder="#1769E0"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManageColorModal(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSettings({ ...settings, theme_color: customColorInput });
                handleSaveSystemSettings({ theme_color: customColorInput });
                setShowManageColorModal(false);
              }}
              className="bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
            >
              Terapkan Warna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: KELOLA BAHASA */}
      <Dialog open={showManageLanguageModal} onOpenChange={setShowManageLanguageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">Kelola Bahasa Platform</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Atur status aktif bahasa dan prioritas tampilan translasi di platform AKSARA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div>
                <span className="font-bold text-[#102B4B]">Bahasa Indonesia (ID)</span>
                <p className="text-[11px] text-slate-400">Bahasa utama & bawaan sistem</p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1769E0]">
                Bawaan
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <span className="font-bold text-[#102B4B]">English (EN)</span>
                <p className="text-[11px] text-slate-400">Terjemahan antarmuka Bahasa Inggris</p>
              </div>
              <Switch
                checked={Boolean(settings.languages?.en)}
                onCheckedChange={(val) => {
                  setSettings({
                    ...settings,
                    languages: { ...settings.languages, en: val },
                  });
                }}
                ariaLabel="Toggle English"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <span className="font-bold text-[#102B4B]">العربية - Bahasa Arab (AR)</span>
                <p className="text-[11px] text-slate-400">Terjemahan antarmuka Bahasa Arab</p>
              </div>
              <Switch
                checked={Boolean(settings.languages?.ar)}
                onCheckedChange={(val) => {
                  setSettings({
                    ...settings,
                    languages: { ...settings.languages, ar: val },
                  });
                }}
                ariaLabel="Toggle Bahasa Arab"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div>
                <span className="font-bold text-[#102B4B]">日本語 - Bahasa Jepang (JA)</span>
                <p className="text-[11px] text-slate-400">Terjemahan antarmuka Bahasa Jepang</p>
              </div>
              <Switch
                checked={Boolean(settings.languages?.ja)}
                onCheckedChange={(val) => {
                  setSettings({
                    ...settings,
                    languages: { ...settings.languages, ja: val },
                  });
                }}
                ariaLabel="Toggle Bahasa Jepang"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManageLanguageModal(false)}
              className="text-xs"
            >
              Tutup
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleSaveSystemSettings({ languages: settings.languages });
                setShowManageLanguageModal(false);
              }}
              className="bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
            >
              Simpan Konfigurasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: RIWAYAT BACKUP */}
      <Dialog open={showBackupHistoryModal} onOpenChange={setShowBackupHistoryModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">Riwayat Pencadangan Data</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Daftar pencadangan database dan berkas sistem AKSARA terakhir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 py-2 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-[#102B4B]">
                    {settings.last_backup_at || '12 Jun 2024, 08:30'}
                  </span>
                  <p className="text-[11px] text-slate-400">Ukuran: 42.8 MB • Tipe: Full Backup</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                Berhasil
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-[#102B4B]">05 Jun 2024, 08:30</span>
                  <p className="text-[11px] text-slate-400">Ukuran: 41.2 MB • Tipe: Full Backup</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                Berhasil
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-[#102B4B]">29 Mei 2024, 08:30</span>
                  <p className="text-[11px] text-slate-400">Ukuran: 39.7 MB • Tipe: Full Backup</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                Berhasil
              </span>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowBackupHistoryModal(false)}
              className="text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: HAPUS AKUN ADMIN */}
      <Dialog open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">
              Konfirmasi Hapus Akun
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus akun administrator Anda? Masukkan password Anda untuk
              mengonfirmasi tindakan ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label htmlFor="del_pass" className="text-xs font-semibold text-slate-700">
                Password Administrator
              </Label>
              <Input
                id="del_pass"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="mt-1.5 h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteAccountModal(false);
                setDeletePassword('');
              }}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!deletePassword}
              onClick={() => {
                router.delete('/settings/profile', {
                  data: { password: deletePassword },
                  preserveScroll: true,
                });
              }}
              className="bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
            >
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
