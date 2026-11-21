import { useState, useTransition, useMemo } from 'react';
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
import AdminLayout from '@/layouts/admin-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  HardDrive,
  History,
  KeyRound,
  Layers,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Terminal,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

interface ActivityLogItem {
  id: number;
  user_id: number | null;
  actor_name: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  module: string;
  module_label: string;
  description: string;
  subject_type: string | null;
  subject_id: string | null;
  subject_label: string | null;
  properties: {
    old?: Record<string, any>;
    new?: Record<string, any>;
    diff?: Record<string, { old: any; new: any }>;
    extra?: Record<string, any>;
  } | null;
  has_diff: boolean;
  diff_count: number;
  severity: 'info' | 'warning' | 'danger';
  ip_address: string;
  browser: string;
  user_agent: string | null;
  method: string | null;
  url: string | null;
  created_at: string;
  created_at_human: string;
  created_at_formatted: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface ActivityLogsPageProps {
  logs: {
    data: ActivityLogItem[];
  } & PaginationMeta;
  filters: {
    search?: string;
    module?: string;
    action?: string;
    severity?: string;
    date_preset?: string;
    start_date?: string;
    end_date?: string;
  };
  metrics: {
    total_count: number;
    today_count: number;
    yesterday_count: number;
    growth_percent: number;
    danger_count: number;
    warning_count: number;
    active_actors_today: number;
    module_stats: Record<string, number>;
    action_stats: Record<string, number>;
  };
  modules_list: Array<{ id: string; label: string }>;
  actions_list: Array<{ id: string; label: string }>;
}

export default function AdminActivityLogsIndex({
  logs,
  filters = {},
  metrics,
  modules_list = [],
  actions_list = [],
}: ActivityLogsPageProps) {
  const page = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
  const flash = page?.props?.flash || {};

  const safeMetrics = metrics || {
    total_count: 0,
    today_count: 0,
    yesterday_count: 0,
    growth_percent: 0,
    danger_count: 0,
    warning_count: 0,
    active_actors_today: 0,
    module_stats: {},
    action_stats: {},
  };

  // State Filter Realtime
  const [search, setSearch] = useState(filters?.search || '');
  const [selectedModule, setSelectedModule] = useState(filters?.module || 'all');
  const [selectedAction, setSelectedAction] = useState(filters?.action || 'all');
  const [selectedSeverity, setSelectedSeverity] = useState(filters?.severity || 'all');
  const [selectedDatePreset, setSelectedDatePreset] = useState(filters?.date_preset || 'all');
  const [isPending, startTransition] = useTransition();

  // State Modal Detail Inspector
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'diff' | 'network' | 'raw'>('diff');
  const [copiedRawJson, setCopiedRawJson] = useState(false);

  // State Modal Prune Log
  const [isPruneModalOpen, setIsPruneModalOpen] = useState(false);
  const [pruneDays, setPruneDays] = useState('30');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPruning, setIsPruning] = useState(false);
  const [pruneError, setPruneError] = useState<string | null>(null);

  // Helper Submit Filters
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    const params: Record<string, string> = {};

    const merged = {
      search,
      module: selectedModule,
      action: selectedAction,
      severity: selectedSeverity,
      date_preset: selectedDatePreset,
      ...newFilters,
    };

    if (merged.search) params.search = merged.search;
    if (merged.module && merged.module !== 'all') params.module = merged.module;
    if (merged.action && merged.action !== 'all') params.action = merged.action;
    if (merged.severity && merged.severity !== 'all') params.severity = merged.severity;
    if (merged.date_preset && merged.date_preset !== 'all') params.date_preset = merged.date_preset;

    startTransition(() => {
      router.get('/admin/activity-logs', params, {
        preserveState: true,
        preserveScroll: true,
      });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedModule('all');
    setSelectedAction('all');
    setSelectedSeverity('all');
    setSelectedDatePreset('all');

    router.get('/admin/activity-logs', {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Helper Prune Log
  const handlePruneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setPruneError('Harap masukkan password administrator Anda.');
      return;
    }

    setIsPruning(true);
    setPruneError(null);

    router.delete('/admin/activity-logs/prune', {
      data: {
        days: parseInt(pruneDays),
        admin_password: adminPassword,
      },
      onSuccess: () => {
        setIsPruning(false);
        setIsPruneModalOpen(false);
        setAdminPassword('');
      },
      onError: (errors) => {
        setIsPruning(false);
        setPruneError(errors.admin_password || errors.days || 'Terjadi kesalahan saat membersihkan log.');
      },
    });
  };

  // Helper Copy JSON
  const handleCopyJson = (obj: any) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedRawJson(true);
    setTimeout(() => setCopiedRawJson(false), 2000);
  };

  // Helper Visual Badges
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Bahaya / Kritis
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Peringatan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Info / Sukses
          </span>
        );
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'users':
        return <Users className="w-3.5 h-3.5 text-blue-600" />;
      case 'companies':
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'vacancies':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-600" />;
      case 'applications':
        return <FileText className="w-3.5 h-3.5 text-cyan-600" />;
      case 'ai_engine':
        return <Bot className="w-3.5 h-3.5 text-purple-600" />;
      case 'settings':
        return <HardDrive className="w-3.5 h-3.5 text-slate-600" />;
      case 'auth':
        return <Lock className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('destroy') || act.includes('prune')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100/70 text-rose-800">
          {action.toUpperCase()}
        </span>
      );
    }
    if (act.includes('create') || act.includes('store') || act.includes('approve')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-100/70 text-emerald-800">
          {action.toUpperCase()}
        </span>
      );
    }
    if (act.includes('reveal_key')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100/80 text-indigo-800">
          REVEAL_KEY
        </span>
      );
    }
    if (act.includes('update') || act.includes('edit')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-100/70 text-amber-800">
          {action.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
        {action.toUpperCase()}
      </span>
    );
  };

  const hasActiveFilters =
    Boolean(search) ||
    selectedModule !== 'all' ||
    selectedAction !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedDatePreset !== 'all';

  // Export CSV URL
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedModule !== 'all') params.set('module', selectedModule);
    if (selectedAction !== 'all') params.set('action', selectedAction);
    if (selectedSeverity !== 'all') params.set('severity', selectedSeverity);
    if (selectedDatePreset !== 'all') params.set('date_preset', selectedDatePreset);
    return `/admin/activity-logs/export?${params.toString()}`;
  }, [search, selectedModule, selectedAction, selectedSeverity, selectedDatePreset]);

  return (
    <AdminLayout>
      <Head title="Audit Log Aktivitas - Aksara Admin" />

      <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
        {/* Flash Notifications */}
        {Boolean(flash?.success) && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{flash?.success}</span>
            </div>
          </div>
        )}

        {Boolean(flash?.error) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{flash?.error}</span>
            </div>
          </div>
        )}

        {/* 1. Header Page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#1769E0] text-white shadow-2xs">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#102B4B] dark:text-white tracking-tight">
                  Audit Log Aktivitas & Kepatuhan Sistem
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rekam jejak komprehensif mutasi data, aksi administratif, dan akses keamanan platform secara presisi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.reload()}
              disabled={isPending}
              className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs font-semibold h-9 rounded-xl shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isPending ? 'animate-spin text-[#1769E0]' : ''}`} />
              <span>Segarkan</span>
            </Button>

            <a
              href={exportUrl}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Unduh seluruh log yang sesuai filter ke file CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </a>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPruneModalOpen(true)}
              className="bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-rose-200 text-xs font-semibold h-9 rounded-xl shadow-2xs"
              title="Bersihkan catatan log lama untuk menghemat kapasitas database"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>Bersihkan Log Lama</span>
            </Button>
          </div>
        </div>

        {/* 2. Empat Kartu Metrik Analitik (KPI Visual Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Log Terkumpul */}
          <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Log Tercatat
                </span>
                <h3 className="text-2xl font-black text-[#102B4B] mt-1.5">
                  {safeMetrics.total_count.toLocaleString('id-ID')}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  {safeMetrics.growth_percent >= 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      +{safeMetrics.growth_percent}%
                    </span>
                  ) : (
                    <span className="text-slate-500 font-bold flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      {safeMetrics.growth_percent}%
                    </span>
                  )}
                  <span className="text-slate-400">vs kemarin</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769E0] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Aktivitas Hari Ini:</span>
              <span className="font-bold text-[#102B4B]">{safeMetrics.today_count.toLocaleString('id-ID')} aksi</span>
            </div>
          </div>

          {/* Card 2: Aksi Kritis / Danger */}
          <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                  Aksi Kritis / Berbahaya
                </span>
                <h3 className="text-2xl font-black text-rose-600 mt-1.5">
                  {safeMetrics.danger_count.toLocaleString('id-ID')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Hapus data, purge & pembongkaran key</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tingkat Risiko:</span>
              <span className="font-bold text-rose-600">Perlu Pengawasan</span>
            </div>
          </div>

          {/* Card 3: Aksi Peringatan / Warning */}
          <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Aksi Perubahan Konfig
                </span>
                <h3 className="text-2xl font-black text-amber-600 mt-1.5">
                  {safeMetrics.warning_count.toLocaleString('id-ID')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Status switch, reject, & limit change</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tingkat Severity:</span>
              <span className="font-bold text-amber-600">Warning Level</span>
            </div>
          </div>

          {/* Card 4: Pengguna Aktif Hari Ini */}
          <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Aktor Aktif Hari Ini
                </span>
                <h3 className="text-2xl font-black text-[#102B4B] mt-1.5">
                  {safeMetrics.active_actors_today}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Admin, Employer, & Jobseeker</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Integritas Log:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Terverifikasi
              </span>
            </div>
          </div>
        </div>

        {/* 3. Filter Toolbar Interaktif */}
        <div className="bg-white rounded-2xl border border-[#EEF2F6] p-4 sm:p-5 shadow-xs space-y-3.5">
          {/* Baris 1: Search & Filter Presets Waktu */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Input Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cari aktor, email, aksi, deskripsi, IP, atau target objek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-20 text-xs h-9 rounded-xl border-slate-200 bg-slate-50/70 focus:bg-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-white bg-[#1769E0] hover:bg-blue-600 rounded-lg transition"
              >
                Cari
              </button>
            </form>

            {/* Presets Rentang Waktu (Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" /> Rentang:
              </span>
              {[
                { id: 'all', label: 'Semua Waktu' },
                { id: 'today', label: 'Hari Ini' },
                { id: 'yesterday', label: 'Kemarin' },
                { id: 'week', label: '7 Hari' },
                { id: 'month', label: '30 Hari' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setSelectedDatePreset(preset.id);
                    applyFilters({ date_preset: preset.id });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    selectedDatePreset === preset.id
                      ? 'bg-[#1769E0] text-white shadow-2xs'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Baris 2: Dropdown Filter Modul, Aksi, Severity, & Reset */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
            {/* Filter Modul */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modul:</span>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  applyFilters({ module: e.target.value });
                }}
                className="text-xs h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#1769E0]"
              >
                {modules_list.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} {safeMetrics.module_stats?.[m.id] ? `(${safeMetrics.module_stats[m.id]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Aksi */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aksi:</span>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  applyFilters({ action: e.target.value });
                }}
                className="text-xs h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#1769E0]"
              >
                {actions_list.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Severity */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tingkat:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => {
                  setSelectedSeverity(e.target.value);
                  applyFilters({ severity: e.target.value });
                }}
                className="text-xs h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-[#1769E0]"
              >
                <option value="all">Semua Severity</option>
                <option value="info">Info (Normal)</option>
                <option value="warning">Warning (Peringatan)</option>
                <option value="danger">Danger (Kritis / Bahaya)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5 rounded-xl ml-auto"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Reset Filter</span>
              </Button>
            )}
          </div>
        </div>

        {/* 4. Tabel Log Aktivitas Advance */}
        <div className="bg-white dark:bg-[#050E2E] rounded-2xl border border-slate-200/90 dark:border-[#1E2B4D] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[1000px]">
              <thead className="bg-[#F8FBFE] dark:bg-[#050E2E] text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-[#1E2B4D] font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-44">Waktu & Tanggal</th>
                  <th className="py-3 px-4 min-w-[200px]">Aktor / Pengguna</th>
                  <th className="py-3 px-4 w-44">Modul & Severity</th>
                  <th className="py-3 px-4 min-w-[280px]">Aksi & Ringkasan Perubahan</th>
                  <th className="py-3 px-4 w-52">Jaringan & Perangkat</th>
                  <th className="py-3 px-4 text-center w-32">Inspeksi Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B4D]">
                {logs.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#050E2E] flex items-center justify-center text-slate-400 mb-3">
                          <History className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-white">Tidak Ada Log Aktivitas Ditemukan</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {hasActiveFilters
                            ? 'Tidak ada rekaman aktivitas yang sesuai dengan parameter filter Anda saat ini.'
                            : 'Belum ada rekaman log audit yang tercatat di database.'}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="mt-3 text-xs font-semibold rounded-xl dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                          >
                            Hapus Semua Filter
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.data.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#0E2254] transition-colors group"
                    >
                      {/* 1. Waktu */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="font-mono text-slate-800 dark:text-white font-bold text-xs">
                          {log.created_at_formatted?.split(',')[1] || log.created_at_human}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {log.created_at_formatted?.split(',')[0]}
                        </div>
                        <span className="inline-block mt-1 text-[10px] text-slate-400 font-medium">
                          {log.created_at_human}
                        </span>
                      </td>

                      {/* 2. Aktor / Pengguna */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#050E2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                            {log.actor_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-1.5">
                              <span>{log.actor_name}</span>
                              {log.actor_role && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-[#38BDF8] dark:border-blue-800/40 capitalize">
                                  {log.actor_role}
                                </span>
                              )}
                            </div>
                            {log.actor_email && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {log.actor_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Modul & Severity */}
                      <td className="py-3.5 px-4 align-top space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          {getModuleIcon(log.module)}
                          <span>{log.module_label}</span>
                        </div>
                        <div>{getSeverityBadge(log.severity)}</div>
                      </td>

                      {/* 4. Aksi & Ringkasan Perubahan */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getActionBadge(log.action)}
                          {log.subject_label && (
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {log.subject_label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {log.description}
                        </p>
                        {log.has_diff && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            <Code className="w-3 h-3" />
                            <span>{log.diff_count} kolom dimutasi</span>
                          </div>
                        )}
                      </td>

                      {/* 5. Jaringan & Perangkat */}
                      <td className="py-3.5 px-4 align-top text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[200px]" title={log.browser || ''}>
                          <Monitor className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{log.browser || 'Unknown Device'}</span>
                        </div>
                        {log.method && (
                          <div className="text-[10px] font-mono text-slate-400 uppercase">
                            HTTP {log.method}
                          </div>
                        )}
                      </td>

                      {/* 6. Tombol Aksi Diff Inspector */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setActiveInspectorTab(log.has_diff ? 'diff' : 'network');
                          }}
                          className="text-xs font-semibold text-[#1769E0] bg-blue-50/50 hover:bg-blue-100/70 border-blue-200 rounded-xl h-8 px-3 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Detail</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {logs.total > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#050E2E] text-xs text-slate-600 dark:text-slate-400">
              <div>
                Menampilkan <span className="font-bold text-slate-800 dark:text-white">{logs.from || 0}</span> sampai{' '}
                <span className="font-bold text-slate-800 dark:text-white">{logs.to || 0}</span> dari{' '}
                <span className="font-bold text-slate-800 dark:text-white">{logs.total.toLocaleString('id-ID')}</span> log aktivitas
              </div>

              {logs.last_page > 1 && (
                <div className="flex items-center gap-1">
                  {logs.links.map((link, idx) => {
                    const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!link.url}
                        onClick={() => {
                          if (link.url) {
                            router.visit(link.url, { preserveScroll: true, preserveState: true });
                          }
                        }}
                        className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition ${
                          link.active
                            ? 'bg-[#1769E0] text-white shadow-2xs'
                            : !link.url
                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-white/10 bg-white dark:bg-[#071336] border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {isPrev ? <ChevronLeft className="w-4 h-4" /> : isNext ? <ChevronRight className="w-4 h-4" /> : link.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. MODAL INSPECTOR DETAIL & DIFF VIEWER (ADVANCE ENTERPRISE INSPECTOR) */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent
          className="w-[95vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:p-7"
          style={{ maxWidth: '980px', width: '95vw' }}
        >
          {selectedLog && (
            <div className="space-y-5">
              <DialogHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getActionBadge(selectedLog.action)}
                      {getSeverityBadge(selectedLog.severity)}
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Modul: {selectedLog.module_label}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Log #{selectedLog.id}
                      </span>
                    </div>
                    <DialogTitle className="text-lg font-bold text-[#102B4B]">
                      {selectedLog.description}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      Direkam pada {selectedLog.created_at_formatted} ({selectedLog.created_at_human})
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Inspector Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveInspectorTab('diff')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                    activeInspectorTab === 'diff'
                      ? 'border-[#1769E0] text-[#1769E0]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Perubahan Data (Diff)</span>
                  {selectedLog.has_diff && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {selectedLog.diff_count}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInspectorTab('network')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                    activeInspectorTab === 'network'
                      ? 'border-[#1769E0] text-[#1769E0]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Jaringan & Sensor Sesi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInspectorTab('raw')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
                    activeInspectorTab === 'raw'
                      ? 'border-[#1769E0] text-[#1769E0]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Raw JSON Payload</span>
                </button>
              </div>

              {/* TAB CONTENT 1: VISUAL DIFF */}
              {activeInspectorTab === 'diff' && (
                <div className="space-y-4">
                  {selectedLog.has_diff ? (
                    <div className="space-y-3">
                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Menampilkan {selectedLog.diff_count} kolom yang mengalami perubahan nilai:</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 font-semibold text-rose-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-200 border border-rose-400" /> Nilai Lama (Before)
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border border-emerald-400" /> Nilai Baru (After)
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                        {Object.entries(selectedLog.properties?.diff || {}).map(([key, change]) => (
                          <div key={key} className="p-3.5 hover:bg-slate-50/60 transition">
                            <div className="font-mono text-xs font-bold text-[#102B4B] mb-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span>{key}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {/* Nilai Lama */}
                              <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-900">
                                <div className="text-[10px] font-bold text-rose-600 uppercase mb-1">Sebelum:</div>
                                <div className="font-mono break-all text-xs">
                                  {change.old === null || change.old === undefined ? (
                                    <em className="text-rose-400">null / kosong</em>
                                  ) : typeof change.old === 'object' ? (
                                    JSON.stringify(change.old)
                                  ) : (
                                    String(change.old)
                                  )}
                                </div>
                              </div>

                              {/* Nilai Baru */}
                              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                                <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Sesudah:</div>
                                <div className="font-mono break-all text-xs font-bold">
                                  {change.new === null || change.new === undefined ? (
                                    <em className="text-emerald-400">null / kosong</em>
                                  ) : typeof change.new === 'object' ? (
                                    JSON.stringify(change.new)
                                  ) : (
                                    String(change.new)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      <Code className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="font-bold text-slate-700">Tidak Ada Kolom Diff Spesifik</div>
                      <p className="mt-1 max-w-md mx-auto">
                        Aksi ini berupa mutasi tunggal (misal akses kunci, login, logout, atau penghapusan data) yang tidak memiliki perbandingan side-by-side kolom.
                      </p>
                    </div>
                  )}

                  {/* Extra Data bila ada */}
                  {selectedLog.properties?.extra && Object.keys(selectedLog.properties.extra).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-700 mb-2">Metadata Tambahan:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {Object.entries(selectedLog.properties.extra).map(([k, v]) => (
                          <div key={k} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{k}</span>
                            <span className="font-mono text-slate-700 font-semibold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT 2: NETWORK & SENSOR */}
              {activeInspectorTab === 'network' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Alamat IP Klien</span>
                    <div className="font-mono text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>{selectedLog.ip_address || '127.0.0.1'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Browser & Sistem Operasi</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-indigo-600" />
                      <span>{selectedLog.browser || 'Unknown Browser'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Metode HTTP & Endpoint URL</span>
                    <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[10px]">{selectedLog.method || 'GET'}</span>
                      <span className="truncate max-w-[240px]" title={selectedLog.url || ''}>
                        {selectedLog.url || '/'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Identitas Aktor</span>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>{selectedLog.actor_name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({selectedLog.actor_role || 'user'})</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Full Raw User-Agent</span>
                    <div className="font-mono text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-lg border border-slate-200">
                      {selectedLog.user_agent || 'Tidak tersedia'}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT 3: RAW JSON */}
              {activeInspectorTab === 'raw' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Representasi JSON payload lengkap:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyJson(selectedLog)}
                      className="text-xs h-8 rounded-xl font-semibold bg-white shadow-2xs"
                    >
                      {copiedRawJson ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin ke Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Salin JSON</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="font-mono text-[11px] p-4 rounded-xl bg-slate-900 text-slate-100 overflow-x-auto max-h-80 leading-relaxed">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              )}

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedLog(null)}
                  className="text-xs font-semibold rounded-xl"
                >
                  Tutup Inspector
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. MODAL KONFIRMASI BERSIHKAN LOG LAMA (PRUNE MODAL DENGAN VERIFIKASI PASSWORD) */}
      <Dialog open={isPruneModalOpen} onOpenChange={setIsPruneModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Bersihkan Catatan Log Lama?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Operasi ini akan menghapus permanen catatan log historis yang lebih lama dari rentang waktu yang Anda tentukan untuk efisiensi basis data.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePruneSubmit} className="space-y-4 pt-2">
            {pruneError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{pruneError}</span>
              </div>
            )}

            {/* Pilihan Rentang Waktu Prune */}
            <div className="space-y-1.5">
              <Label htmlFor="prune_days" className="text-xs font-semibold text-slate-700">
                Hapus Log Yang Lebih Lama Dari:
              </Label>
              <select
                id="prune_days"
                value={pruneDays}
                onChange={(e) => setPruneDays(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="7">7 Hari (1 Minggu)</option>
                <option value="30">30 Hari (1 Bulan) - Rekomendasi</option>
                <option value="60">60 Hari (2 Bulan)</option>
                <option value="90">90 Hari (1 Kuartal)</option>
                <option value="180">180 Hari (Setengah Tahun)</option>
                <option value="365">365 Hari (1 Tahun)</option>
              </select>
            </div>

            {/* Input Password Administrator */}
            <div className="space-y-1.5">
              <Label htmlFor="admin_pw" className="text-xs font-semibold text-slate-700">
                Ketik Password Akun Administrator Anda <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="admin_pw"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password admin login Anda..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="text-xs h-10 rounded-xl pr-10 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Dibutuhkan verifikasi otentikasi untuk mencegah penghapusan jejak audit yang tidak disengaja.
              </p>
            </div>

            <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPruneModalOpen(false);
                  setAdminPassword('');
                  setPruneError(null);
                }}
                className="text-xs font-semibold rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPruning}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {isPruning ? 'Memproses...' : 'Konfirmasi Bersihkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
