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
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Cpu,
  Database,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Key,
  Layers,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Terminal,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactElement } from 'react';

export interface AiConfigItem {
  id: number;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom' | 'mock';
  model: string;
  enabled_models: string[];
  model_limits?: Record<string, any> | null;
  base_url: string | null;
  timeout: number;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  is_primary: boolean;
  rate_limit_rpm: number;
  tpm_limit: number;
  daily_request_limit: number;
  monthly_request_limit: number;
  total_requests: number;
  total_tokens: number;
  success_requests: number;
  failed_requests: number;
  last_used_at: string | null;
  last_health_status: 'unknown' | 'healthy' | 'degraded' | 'error';
  last_health_check_at: string | null;
  last_error_message: string | null;
  notes: string | null;
  masked_api_key: string;
  has_api_key: boolean;
  today_requests: number;
  this_month_requests: number;
  is_daily_limit_exceeded: boolean;
  is_monthly_limit_exceeded: boolean;
}

export interface CatalogModelItem {
  id: string;
  name: string;
  provider: string;
  category: string;
  rpm: number; // 0 denotes unlimited
  tpm: number;
  rpd: number; // 0 denotes unlimited
  is_recommended?: boolean;
  description?: string;
  display_name?: string;
  is_live_detected?: boolean;
}

export interface AiSummary {
  total_configs: number;
  active_configs: number;
  primary_config: AiConfigItem | null;
  total_requests: number;
  today_requests: number;
  this_month_requests: number;
  success_requests: number;
  failed_requests: number;
  success_rate: number;
  total_tokens: number;
}

export interface AiLogItem {
  id: number;
  config_name: string;
  user_name: string;
  user_email: string | null;
  action_type: 'job_match' | 'skill_gap' | 'cv_review' | 'health_check' | string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  response_time_ms: number;
  status: 'success' | 'failed';
  error_message: string | null;
  created_at: string;
}

export interface ModelRealtimeUsageItem {
  current_rpm: number;
  current_tpm: number;
  today_rpd: number;
  today_tokens: number;
}

export interface RoutingSettingsItem {
  mode: 'manual' | 'single_api_rotation' | 'all_api_rotation' | 'smart_failover' | 'quota_saver';
  strategy: 'failover' | 'round_robin';
  allow_mock_fallback: boolean;
  manual_config_id?: number | null;
  manual_model?: string | null;
  updated_at?: string | null;
}

export interface AvailableModeItem {
  id: string;
  name: string;
  short_title: string;
  badge: string;
  description: string;
  best_for: string;
  pros: string;
  cons: string;
}

interface PageProps {
  configs: AiConfigItem[];
  summary: AiSummary;
  recentLogs: AiLogItem[];
  catalog_models?: CatalogModelItem[];
  model_realtime_usage?: Record<string, ModelRealtimeUsageItem>;
  routing_settings?: RoutingSettingsItem;
  available_modes?: AvailableModeItem[];
  flash?: {
    success?: string | null;
    error?: string | null;
  };
}

const DEFAULT_CATALOG: CatalogModelItem[] = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 15,
    tpm: 1000000,
    rpd: 1500,
    is_recommended: true,
    description: 'Generasi ke-2 Google Gemini produksi tercepat dan cerdas untuk pencocokan kerja & CV.',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 30,
    tpm: 1000000,
    rpd: 1500,
    is_recommended: true,
    description: 'Model teks berkecepatan tinggi dengan kuota RPM tertinggi (30 RPM).',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 15,
    tpm: 1000000,
    rpd: 1500,
    is_recommended: true,
    description: 'Model klasik serbaguna dengan jendela konteks 1 juta token, stabil untuk JSON dokumen.',
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 15,
    tpm: 1000000,
    rpd: 1500,
    is_recommended: false,
    description: 'Varian 8 miliar parameter yang sangat ringan dan hemat sumber daya.',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 15,
    tpm: 250000,
    rpd: 500,
    is_recommended: true,
    description: 'Generasi 3.5 Flash Lite efisien (15 RPM, 250K TPM, 500 RPD).',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 15,
    tpm: 250000,
    rpd: 500,
    is_recommended: false,
    description: 'Model inferensi cepat 3.1 Flash Lite (15 RPM, 250K TPM, 500 RPD).',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 5,
    tpm: 250000,
    rpd: 20,
    is_recommended: false,
    description: 'Model preview Gemini 2.5 Flash (5 RPM, 250K TPM, 20 RPD).',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 10,
    tpm: 250000,
    rpd: 20,
    is_recommended: false,
    description: 'Model preview Gemini 2.5 Flash Lite (10 RPM, 250K TPM, 20 RPD).',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    category: 'Text-out models',
    rpm: 5,
    tpm: 250000,
    rpd: 20,
    is_recommended: false,
    description: 'Model preview cerdas 3.8 Flash (5 RPM, 250K TPM, 20 RPD).',
  },
  {
    id: 'gemini-2.5-flash-native-audio-dialog',
    name: 'Gemini 2.5 Flash Native Audio Dialog',
    provider: 'gemini',
    category: 'Live API',
    rpm: 0,
    tpm: 1000000,
    rpd: 0,
    is_recommended: false,
    description: 'Live API WebSocket dialog suara (Unlimited RPM & RPD, 1M TPM).',
  },
  {
    id: 'gemini-3-flash-live',
    name: 'Gemini 3 Flash Live',
    provider: 'gemini',
    category: 'Live API',
    rpm: 0,
    tpm: 65000,
    rpd: 0,
    is_recommended: false,
    description: 'Live API streaming dua arah (Unlimited RPM & RPD, 65K TPM).',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    category: 'Text-out models',
    rpm: 500,
    tpm: 200000,
    rpd: 10000,
    is_recommended: true,
    description: 'Model OpenAI ringkas, cepat, dan ekonomis untuk inferensi teks JSON.',
  },
  {
    id: 'rule-based-mock-v1',
    name: 'Profabel Heuristic Mock Engine',
    provider: 'mock',
    category: 'Offline Heuristic Engine',
    rpm: 300,
    tpm: 1000000,
    rpd: 10000,
    is_recommended: true,
    description: 'Algoritma pencocokan inklusif lokal offline tanpa ketergantungan internet/token.',
  },
];

export default function AiManagementIndex({
  configs,
  summary,
  recentLogs,
  catalog_models = DEFAULT_CATALOG,
  model_realtime_usage = {},
  routing_settings = {
    mode: 'single_api_rotation',
    strategy: 'failover',
    allow_mock_fallback: true,
    manual_config_id: null,
    manual_model: null,
  },
  available_modes = [],
}: PageProps): ReactElement {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

  const [activeTab, setActiveTab] = useState<'providers' | 'routing' | 'logs' | 'docs'>('providers');
  const [searchLog, setSearchLog] = useState('');
  const [logFilterAction, setLogFilterAction] = useState<string>('all');
  const [logFilterStatus, setLogFilterStatus] = useState<string>('all');

  // Routing & Rotation Settings State
  const [routingForm, setRoutingForm] = useState<RoutingSettingsItem>({
    mode: routing_settings?.mode || 'single_api_rotation',
    strategy: routing_settings?.strategy || 'failover',
    allow_mock_fallback: routing_settings?.allow_mock_fallback ?? true,
    manual_config_id: routing_settings?.manual_config_id || (configs[0]?.id ?? null),
    manual_model: routing_settings?.manual_model || (configs[0]?.model ?? ''),
  });
  const [isSavingRouting, setIsSavingRouting] = useState(false);

  const handleSaveRoutingSettings = (overrideState?: Partial<RoutingSettingsItem>) => {
    setIsSavingRouting(true);
    const payload = { ...routingForm, ...overrideState };
    router.post('/admin/ai-management/routing-settings', payload, {
      preserveScroll: true,
      onFinish: () => setIsSavingRouting(false),
    });
  };

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AiConfigItem | null>(null);

  // Real-time polling & refresh states (Aktif secara default setiap 8 detik untuk visual realtime)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      router.reload({
        only: ['configs', 'summary', 'recentLogs', 'model_realtime_usage'],
        preserveScroll: true,
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    router.reload({
      only: ['configs', 'summary', 'recentLogs', 'model_realtime_usage'],
      preserveScroll: true,
      onFinish: () => setIsRefreshing(false),
    });
  };

  // Form Fields - Default Clean / Kosong
  const [formData, setFormData] = useState({
    name: '',
    provider: 'gemini' as AiConfigItem['provider'],
    api_key: '',
    admin_password: '',
    model: '',
    enabled_models: [] as string[],
    base_url: '',
    timeout: 20,
    max_tokens: 1500,
    temperature: 0.2,
    rate_limit_rpm: 0,
    tpm_limit: 0,
    daily_request_limit: 0,
    monthly_request_limit: 0,
    is_active: true,
    is_primary: false,
    notes: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [formTesting, setFormTesting] = useState(false);
  const [formTestResult, setFormTestResult] = useState<{
    success: boolean;
    message: string;
    latency_ms?: number;
  } | null>(null);

  // Model Selection & Live Catalog States inside Modal
  const [modelSearch, setModelSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<CatalogModelItem[]>(catalog_models);
  const [fetchNotice, setFetchNotice] = useState<{ text: string; isLive: boolean } | null>(null);
  const [switchingModelId, setSwitchingModelId] = useState<number | null>(null);

  // Card Action States
  const [testingId, setTestingId] = useState<number | null>(null);
  const [cardTestFeedback, setCardTestFeedback] = useState<{
    id: number;
    success: boolean;
    message: string;
    latency_ms?: number;
  } | null>(null);

  // Dialog Confirmations
  const [deleteTarget, setDeleteTarget] = useState<AiConfigItem | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [resetTarget, setResetTarget] = useState<AiConfigItem | null>(null);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  // Security Verification for Revealing / Copying API Key
  const [revealedKeys, setRevealedKeys] = useState<Record<number, string>>({});
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityAction, setSecurityAction] = useState<'view' | 'copy'>('view');
  const [verifyingConfig, setVerifyingConfig] = useState<AiConfigItem | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  // Copy helper
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Format Helper Functions
  const formatCompactNumber = (num: number): string => {
    if (num === undefined || num === null || isNaN(num) || num <= 0) return '0';
    if (num >= 1000000) {
      const val = num / 1000000;
      return val % 1 === 0 ? `${val}M` : `${val.toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (num >= 1000) {
      const val = num / 1000;
      // Menghasilkan 5.05K, 250K, 1.5K sesuai visual resmi Google AI Studio
      return val % 1 === 0 ? `${val}K` : `${val.toFixed(2).replace(/\.?0+$/, '')}K`;
    }
    return num.toString();
  };

  const formatRPM = (rpm: number) => (rpm <= 0 ? 'Unlimited' : `${rpm} RPM`);
  const formatTPM = (tpm: number) => {
    if (tpm <= 0) return 'Unlimited';
    if (tpm >= 1000000) return `${(tpm / 1000000).toFixed(tpm % 1000000 === 0 ? 0 : 1)}M TPM`;
    if (tpm >= 1000) return `${Math.round(tpm / 1000)}K TPM`;
    return `${tpm} TPM`;
  };
  const formatRPD = (rpd: number) => (rpd <= 0 ? 'Unlimited' : `${rpd.toLocaleString('id-ID')} RPD`);

  // Helper untuk mencari metadata spesifikasi model (Category, RPM, TPM, RPD)
  const getModelMeta = (modelId: string, provider: string): CatalogModelItem => {
    const found = availableModels.find((m) => m.id === modelId) || catalog_models.find((m) => m.id === modelId);
    if (found) return found;

    const isLive = modelId.toLowerCase().includes('live') || modelId.toLowerCase().includes('dialog');
    return {
      id: modelId,
      name: modelId,
      provider: provider,
      category: isLive ? 'Live API' : 'Text-out models',
      rpm: isLive ? 0 : 15,
      tpm: 250000,
      rpd: isLive ? 0 : 500,
      description: 'Model terdaftar pada API Key ini',
    };
  };

  // Google AI Studio Rate Limit Realtime Gauge Component
  const GoogleAiGauge = ({
    current = 0,
    max = 0,
    label,
    isUnlimited = false,
    formatCompact = false,
  }: {
    current?: number;
    max: number;
    label?: string;
    isUnlimited?: boolean;
    formatCompact?: boolean;
  }) => {
    if (isUnlimited || max <= 0) {
      return (
        <div className="flex items-center gap-2 font-mono text-xs" title="Batas tidak dibatasi (Unlimited)">
          <div className="w-12 h-1.5 rounded-full bg-indigo-100 overflow-hidden shrink-0">
            <div className="h-full w-full rounded-full bg-indigo-400/70" />
          </div>
          <span className="text-indigo-700 font-semibold text-[11px] whitespace-nowrap">
            {current > 0 ? `${formatCompact ? formatCompactNumber(current) : current} / ∞` : 'Unlimited'}
          </span>
        </div>
      );
    }

    const safeCurrent = Math.max(0, current);
    const percent = max > 0 ? Math.min(100, Math.round((safeCurrent / max) * 100)) : 0;
    const isOver = safeCurrent >= max;
    const isWarning = percent >= 80 && !isOver;
    const hasUsage = safeCurrent > 0;

    const currentText = formatCompact ? formatCompactNumber(safeCurrent) : safeCurrent.toString();
    const maxText = formatCompact ? formatCompactNumber(max) : max.toString();
    const displayText = label || `${currentText} / ${maxText}`;

    // Warna bar dinamis persis Google AI Studio (Merah saat batas terlampaui, Amber saat beban tinggi, Biru saat ada traffic)
    const barFillClass = isOver
      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
      : isWarning
      ? 'bg-amber-500'
      : hasUsage
      ? 'bg-[#1769E0]'
      : 'bg-slate-300';

    const textClass = isOver
      ? 'text-rose-600 font-bold'
      : isWarning
      ? 'text-amber-700 font-bold'
      : hasUsage
      ? 'text-slate-800 font-semibold'
      : 'text-slate-400 font-medium';

    return (
      <div
        className="flex items-center gap-2 font-mono text-xs"
        title={`Penggunaan aktual: ${safeCurrent.toLocaleString('id-ID')} / ${max.toLocaleString('id-ID')} (${percent}%)`}
      >
        {/* Visual Pill Loading Bar */}
        <div className="w-12 sm:w-14 h-2 rounded-full bg-slate-200/90 dark:bg-slate-700/60 overflow-hidden shrink-0 flex items-center p-[0.5px]">
          {hasUsage ? (
            <div
              className={`h-full rounded-full transition-all duration-500 ${barFillClass}`}
              style={{ width: `${Math.max(12, percent)}%` }}
            />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-0.5" />
          )}
        </div>

        {/* Indikator Teks Realtime */}
        <span className={`text-[11px] whitespace-nowrap ${textClass}`}>
          {displayText}
        </span>
      </div>
    );
  };

  const requestRevealKey = (cfg: AiConfigItem, action: 'view' | 'copy') => {
    if (cfg.provider === 'mock' || !cfg.has_api_key) return;

    if (revealedKeys[cfg.id]) {
      if (action === 'copy') {
        navigator.clipboard.writeText(revealedKeys[cfg.id]);
        setCopiedId(cfg.id);
        setSecurityToast('Kunci API berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedId(null), 2500);
        setTimeout(() => setSecurityToast(null), 3000);
      }
      return;
    }

    setVerifyingConfig(cfg);
    setSecurityAction(action);
    setAdminPassword('');
    setSecurityError(null);
    setShowAdminPassword(false);
    setIsSecurityModalOpen(true);
  };

  const handleSecurityVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingConfig) return;

    setIsVerifyingPassword(true);
    setSecurityError(null);

    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const res = await fetch(`/admin/ai-management/${verifyingConfig.id}/reveal-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.api_key) {
        setRevealedKeys((prev) => ({ ...prev, [verifyingConfig.id]: data.api_key }));
        setIsSecurityModalOpen(false);
        setAdminPassword('');

        if (securityAction === 'copy') {
          navigator.clipboard.writeText(data.api_key);
          setCopiedId(verifyingConfig.id);
          setSecurityToast('Verifikasi sukses! API Key berhasil disalin ke clipboard.');
          setTimeout(() => setCopiedId(null), 2500);
        } else {
          setSecurityToast('Verifikasi sukses! Kunci API kini ditampilkan.');
        }
        setTimeout(() => setSecurityToast(null), 3500);
      } else {
        setSecurityError(data.message || 'Password admin yang Anda masukkan salah.');
      }
    } catch (err: any) {
      setSecurityError(err.message || 'Terjadi kesalahan saat memverifikasi password.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // 1. OPEN CREATE MODAL: Form Dimulai Dalam Kondisi Kosong (Blank) Tanpa Preset Terpilih
  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedConfig(null);
    setFormData({
      name: '',
      provider: 'gemini',
      api_key: '',
      admin_password: '',
      model: '',
      enabled_models: [],
      base_url: 'https://generativelanguage.googleapis.com/v1beta',
      timeout: 20,
      max_tokens: 1500,
      temperature: 0.2,
      rate_limit_rpm: 0,
      tpm_limit: 0,
      daily_request_limit: 0,
      monthly_request_limit: 0,
      is_active: true,
      is_primary: configs.length === 0,
      notes: '',
    });
    setFormTestResult(null);
    setShowApiKey(false);
    setShowEditPassword(false);
    setFetchNotice(null);
    setModelSearch('');
    setCategoryFilter('all');
    setAvailableModels(catalog_models.filter((m) => m.provider === 'gemini'));
    setIsFormOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (cfg: AiConfigItem) => {
    setIsEditing(true);
    setSelectedConfig(cfg);
    setFormData({
      name: cfg.name,
      provider: cfg.provider,
      api_key: '',
      admin_password: '',
      model: cfg.model,
      enabled_models: cfg.enabled_models && cfg.enabled_models.length > 0 ? cfg.enabled_models : [cfg.model],
      base_url: cfg.base_url || '',
      timeout: cfg.timeout,
      max_tokens: cfg.max_tokens,
      temperature: cfg.temperature,
      rate_limit_rpm: cfg.rate_limit_rpm,
      tpm_limit: cfg.tpm_limit || 0,
      daily_request_limit: cfg.daily_request_limit,
      monthly_request_limit: cfg.monthly_request_limit,
      is_active: cfg.is_active,
      is_primary: cfg.is_primary,
      notes: cfg.notes || '',
    });
    setFormTestResult(null);
    setShowApiKey(false);
    setShowEditPassword(false);
    setFetchNotice(null);
    setModelSearch('');
    setCategoryFilter('all');
    setAvailableModels(catalog_models.filter((m) => m.provider === cfg.provider));
    setIsFormOpen(true);
  };

  // LIVE FETCH AVAILABLE MODELS FROM API KEY OR OFFICIAL PROVIDER
  const handleLiveFetchModels = async () => {
    setIsFetchingModels(true);
    setFetchNotice(null);
    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const res = await fetch('/admin/ai-management/fetch-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          provider: formData.provider,
          api_key: formData.api_key || undefined,
          config_id: isEditing && selectedConfig ? selectedConfig.id : undefined,
          base_url: formData.base_url || undefined,
        }),
      });

      const data = await res.json();
      if (data.models && data.models.length > 0) {
        setAvailableModels(data.models);
      }
      setFetchNotice({
        text: data.message || 'Model berhasil dimuat.',
        isLive: data.is_live ?? false,
      });
    } catch (err: any) {
      setFetchNotice({
        text: err.message || 'Gagal mendeteksi model.',
        isLive: false,
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  // MULTI-MODEL TOGGLE HANDLER (1 API Key Can Hold Multiple Enabled Models)
  const toggleModelSelection = (modelItem: CatalogModelItem) => {
    const isCurrentlyChecked = formData.enabled_models.includes(modelItem.id);
    let nextList: string[];

    if (isCurrentlyChecked) {
      nextList = formData.enabled_models.filter((id) => id !== modelItem.id);
      // If we unchecked the active primary model, fall back to the first available or empty
      let nextPrimaryModel = formData.model;
      if (formData.model === modelItem.id) {
        nextPrimaryModel = nextList.length > 0 ? nextList[0] : '';
      }
      setFormData((prev) => ({
        ...prev,
        enabled_models: nextList,
        model: nextPrimaryModel,
      }));
    } else {
      nextList = [...formData.enabled_models, modelItem.id];
      // If no primary model selected yet, set this as primary and sync parameters
      const nextPrimaryModel = formData.model ? formData.model : modelItem.id;
      setFormData((prev) => ({
        ...prev,
        enabled_models: nextList,
        model: nextPrimaryModel,
        rate_limit_rpm: prev.rate_limit_rpm === 0 ? modelItem.rpm : prev.rate_limit_rpm,
        tpm_limit: prev.tpm_limit === 0 ? modelItem.tpm : prev.tpm_limit,
        daily_request_limit: prev.daily_request_limit === 0 ? modelItem.rpd : prev.daily_request_limit,
      }));
    }
  };

  // SET DEFAULT PRIMARY MODEL FOR THIS CONFIG
  const setModelAsDefault = (modelItem: CatalogModelItem) => {
    let nextList = [...formData.enabled_models];
    if (!nextList.includes(modelItem.id)) {
      nextList.push(modelItem.id);
    }
    setFormData((prev) => ({
      ...prev,
      model: modelItem.id,
      enabled_models: nextList,
      rate_limit_rpm: modelItem.rpm,
      tpm_limit: modelItem.tpm,
      daily_request_limit: modelItem.rpd,
    }));
  };

  // QUICK SWITCH MODEL DIRECTLY ON THE CARD (WITHOUT RE-ENTERING API KEY)
  const handleQuickSwitchModel = (cfg: AiConfigItem, newModel: string) => {
    if (cfg.model === newModel) return;
    setSwitchingModelId(cfg.id);
    router.post(
      `/admin/ai-management/${cfg.id}/switch-model`,
      { model: newModel },
      {
        preserveScroll: true,
        onFinish: () => setSwitchingModelId(null),
      }
    );
  };

  // Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model && formData.enabled_models.length > 0) {
      formData.model = formData.enabled_models[0];
    }
    if (formData.model && !formData.enabled_models.includes(formData.model)) {
      formData.enabled_models.push(formData.model);
    }

    if (isEditing && selectedConfig) {
      router.put(`/admin/ai-management/${selectedConfig.id}`, formData, {
        onSuccess: () => setIsFormOpen(false),
      });
    } else {
      router.post('/admin/ai-management', formData, {
        onSuccess: () => setIsFormOpen(false),
      });
    }
  };

  // Live Test inside Modal Form
  const testFormConnection = async () => {
    setFormTesting(true);
    setFormTestResult(null);
    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const res = await fetch('/admin/ai-management/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          provider: formData.provider,
          api_key: formData.api_key || (isEditing && selectedConfig ? undefined : formData.api_key),
          model: formData.model || (formData.enabled_models[0] || 'gemini-1.5-flash'),
          base_url: formData.base_url || null,
          timeout: formData.timeout,
        }),
      });

      const data = await res.json();
      setFormTestResult({
        success: data.success ?? false,
        message: data.message || (data.success ? 'Koneksi berhasil terhubung!' : 'Gagal terhubung ke provider.'),
        latency_ms: data.latency_ms,
      });
    } catch (err: any) {
      setFormTestResult({
        success: false,
        message: err.message || 'Koneksi ke endpoint gagal.',
      });
    } finally {
      setFormTesting(false);
    }
  };

  // Test Saved Config Directly from Card
  const testSavedConfig = async (cfg: AiConfigItem) => {
    setTestingId(cfg.id);
    setCardTestFeedback(null);
    try {
      const csrfToken =
        document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const res = await fetch(`/admin/ai-management/${cfg.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      setCardTestFeedback({
        id: cfg.id,
        success: data.success ?? false,
        message: data.message || (data.success ? 'Koneksi berhasil teruji!' : 'Gagal terhubung.'),
        latency_ms: data.latency_ms,
      });
    } catch (err: any) {
      setCardTestFeedback({
        id: cfg.id,
        success: false,
        message: err.message || 'Gagal menghubungi server.',
      });
    } finally {
      setTestingId(null);
    }
  };

  // Toggle Active
  const handleToggleActive = (cfg: AiConfigItem) => {
    router.post(`/admin/ai-management/${cfg.id}/toggle-active`, {}, { preserveScroll: true });
  };

  // Set Primary Driver
  const handleSetPrimary = (cfg: AiConfigItem) => {
    router.post(`/admin/ai-management/${cfg.id}/primary`, {}, { preserveScroll: true });
  };

  // Reset Stats
  const handleResetStats = () => {
    if (!resetTarget) return;
    router.post(
      `/admin/ai-management/${resetTarget.id}/reset-stats`,
      {},
      {
        onSuccess: () => setResetTarget(null),
        preserveScroll: true,
      }
    );
  };

  // Delete Config
  const handleDeleteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;

    router.delete(`/admin/ai-management/${deleteTarget.id}`, {
      data: { admin_password: deletePassword },
      onSuccess: () => {
        setDeleteTarget(null);
        setDeletePassword('');
      },
      preserveScroll: true,
    });
  };

  // Clear Logs
  const handleClearLogs = () => {
    router.delete('/admin/ai-management/logs/clear', {
      onSuccess: () => setIsClearingLogs(false),
      preserveScroll: true,
    });
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return recentLogs.filter((log) => {
      const matchSearch =
        searchLog.trim() === '' ||
        log.user_name.toLowerCase().includes(searchLog.toLowerCase()) ||
        log.config_name.toLowerCase().includes(searchLog.toLowerCase()) ||
        log.model.toLowerCase().includes(searchLog.toLowerCase()) ||
        (log.error_message && log.error_message.toLowerCase().includes(searchLog.toLowerCase()));

      const matchAction = logFilterAction === 'all' || log.action_type === logFilterAction;
      const matchStatus = logFilterStatus === 'all' || log.status === logFilterStatus;

      return matchSearch && matchAction && matchStatus;
    });
  }, [recentLogs, searchLog, logFilterAction, logFilterStatus]);

  // Filtered Catalog in Modal
  const modalCatalogFiltered = useMemo(() => {
    return availableModels.filter((m) => {
      const matchSearch =
        modelSearch.trim() === '' ||
        m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(modelSearch.toLowerCase()));

      const matchCat = categoryFilter === 'all' || m.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [availableModels, modelSearch, categoryFilter]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    availableModels.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [availableModels]);

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Google Gemini
          </span>
        );
      case 'openai':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            OpenAI GPT
          </span>
        );
      case 'anthropic':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/80 shadow-xs">
            <Bot className="w-3.5 h-3.5 text-violet-600" />
            Anthropic Claude
          </span>
        );
      case 'mock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs">
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            Mock Engine (Offline)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
            <Server className="w-3.5 h-3.5 text-amber-600" />
            Custom LLM
          </span>
        );
    }
  };

  const getHealthBadge = (status: string, lastCheck: string | null) => {
    switch (status) {
      case 'healthy':
        return (
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Normal & Aktif</span>
          </div>
        );
      case 'degraded':
        return (
          <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Degraded / Lambat</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-rose-700 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Error / Kunci Tidak Valid</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Belum diuji</span>
          </div>
        );
    }
  };

  return (
    <AdminLayout title="AI API Management">
      <Head title="AI API Management - Admin Profabel" />

      {/* Outer wrapper with comfortable breathing padding away from sidebar */}
      <div className="min-h-screen bg-[#F8FBFE] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-12">
          {/* Flash Message Alerts */}
          {flash?.success && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{flash.success}</span>
            </div>
          )}
          {flash?.error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium shadow-xs animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{flash.error}</span>
            </div>
          )}

          {/* Security Toast */}
          {securityToast && (
            <div className="flex items-center gap-3 p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{securityToast}</span>
            </div>
          )}

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#1769E0] to-[#0A57C2] text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#102B4B]">
                  AI API Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1769E0] border border-blue-200/80">
                  Multi-Model Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Kelola API Key, pantau rate limit per model (RPM, TPM, RPD), dan gunakan banyak model dalam 1 API Key dengan rotasi & failover otomatis.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Toggle Auto-Refresh */}
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  autoRefresh
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title={autoRefresh ? 'Matikan auto polling realtime' : 'Aktifkan auto polling setiap 8 detik'}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                ></span>
                <span>Live: {autoRefresh ? 'ON (8s)' : 'OFF'}</span>
              </button>

              {/* Manual Refresh */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="bg-white border-slate-200 text-slate-700 hover:text-[#1769E0] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#1769E0]' : ''}`}
                />
                <span>{isRefreshing ? 'Memuat...' : 'Segarkan Data'}</span>
              </Button>

              <Button
                type="button"
                onClick={openCreateModal}
                className="bg-[#1769E0] hover:bg-[#0A57C2] text-white shadow-xs font-semibold flex items-center gap-2 px-4 py-2 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Provider AI</span>
              </Button>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Provider Aktif & Utama */}
            <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Provider Utama
                  </span>
                  <h3 className="text-lg font-bold text-[#102B4B] mt-1 truncate max-w-[190px]">
                    {summary.primary_config ? summary.primary_config.name : 'Tidak Ada'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {summary.primary_config ? summary.primary_config.model : 'Pilih provider utama'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769E0] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Status Provider:</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {summary.active_configs} dari {summary.total_configs} Aktif
                </span>
              </div>
            </div>

            {/* Card 2: Total Panggilan AI */}
            <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Total Request AI
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#102B4B] mt-1">
                    {summary.total_requests.toLocaleString('id-ID')}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-[#1769E0]">
                      {summary.today_requests}
                    </span>
                    <span>panggilan hari ini</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Bulan Ini:</span>
                <span className="font-semibold text-slate-700">
                  {summary.this_month_requests.toLocaleString('id-ID')} calls
                </span>
              </div>
            </div>

            {/* Card 3: Success Rate */}
            <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tingkat Keberhasilan
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#102B4B] mt-1">
                    {summary.success_rate}%
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="text-emerald-600 font-semibold">
                      ✓ {summary.success_requests} sukses
                    </span>
                    {summary.failed_requests > 0 && (
                      <span className="text-rose-500 font-medium">
                        ✕ {summary.failed_requests} gagal
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Kualitas Respons:</span>
                <span className="font-semibold text-emerald-600">Sangat Stabil</span>
              </div>
            </div>

            {/* Card 4: Token Usage */}
            <div className="p-5 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Estimasi Token Terpakai
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#102B4B] mt-1">
                    {summary.total_tokens.toLocaleString('id-ID')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Prompt & Output akumulatif</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Mode Rotasi Aktif:</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('routing')}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <span>
                    {routingForm.mode === 'manual'
                      ? '1. Manual (Single)'
                      : routingForm.mode === 'all_api_rotation'
                      ? '3. Rotasi Semua API'
                      : routingForm.mode === 'smart_failover'
                      ? '4. Smart Adaptive'
                      : routingForm.mode === 'quota_saver'
                      ? '5. Quota Saver'
                      : '2. Rotasi 1 API'}
                  </span>
                  <Sliders className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#EEF2F6] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('providers')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'providers'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Daftar Provider AI ({configs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routing')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'routing'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Mode Rotasi & Routing AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-[#1769E0]">
                {routingForm.mode === 'manual'
                  ? 'Manual'
                  : routingForm.mode === 'all_api_rotation'
                  ? 'Semua API'
                  : routingForm.mode === 'smart_failover'
                  ? 'Smart'
                  : routingForm.mode === 'quota_saver'
                  ? 'Quota Saver'
                  : '1 API'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Riwayat & Log Panggilan ({recentLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Panduan Multi-Model & Rate Limit (RPM/TPM/RPD)</span>
            </button>
          </div>

          {/* TAB 1: PROVIDERS LIST */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              {/* Quick Status Routing Mode Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-100 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#1769E0] text-white shrink-0 shadow-2xs">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#102B4B]">Mode Rotasi AI Aktif:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1769E0] text-white">
                        {routingForm.mode === 'manual'
                          ? '1. Mode Manual (Single Model)'
                          : routingForm.mode === 'all_api_rotation'
                          ? '3. Mode Rotasi Semua API'
                          : routingForm.mode === 'smart_failover'
                          ? '4. Smart Adaptive Failover'
                          : routingForm.mode === 'quota_saver'
                          ? '5. Quota Saver'
                          : '2. Mode Rotasi 1 API (Multi-Model)'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        Strategi: {routingForm.strategy === 'round_robin' ? 'Round-Robin Seimbang' : 'Priority Failover'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {routingForm.mode === 'manual'
                        ? 'Hanya menggunakan 1 model tetap tanpa rotasi otomatis.'
                        : routingForm.mode === 'all_api_rotation'
                        ? 'Memutar beban request dan failover melintasi seluruh API Key & provider aktif.'
                        : routingForm.mode === 'smart_failover'
                        ? 'Mengutamakan model terbaik, rotasi otomatis hanya saat terkena rate limit 429 atau kuota habis.'
                        : routingForm.mode === 'quota_saver'
                        ? 'Memprioritaskan model dengan kuota RPM tertinggi (30 RPM Flash Lite) terlebih dahulu.'
                        : 'Memaksimalkan seluruh model gratis dalam 1 API Key dengan failover pintar.'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('routing')}
                  className="shrink-0 bg-white hover:bg-blue-50 text-[#1769E0] border-blue-200 text-xs font-semibold rounded-xl h-8 shadow-2xs flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Ubah Mode & Strategi</span>
                </Button>
              </div>
              {cardTestFeedback && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-start justify-between border ${
                    cardTestFeedback.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cardTestFeedback.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold">{cardTestFeedback.message}</span>
                      {cardTestFeedback.latency_ms && (
                        <span className="ml-2 text-xs opacity-80">
                          (Latensi: {cardTestFeedback.latency_ms} ms)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardTestFeedback(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {configs.map((cfg) => {
                  const isDailyExceeded = cfg.is_daily_limit_exceeded;
                  const dailyPercent =
                    cfg.daily_request_limit > 0
                      ? Math.min(100, Math.round((cfg.today_requests / cfg.daily_request_limit) * 100))
                      : 0;

                  const modelList = cfg.enabled_models && cfg.enabled_models.length > 0 ? cfg.enabled_models : [cfg.model];

                  return (
                    <div
                      key={cfg.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 p-6 shadow-xs space-y-4 ${
                        cfg.is_primary
                          ? 'border-[#1769E0]/40 ring-2 ring-[#1769E0]/10'
                          : !cfg.is_active
                          ? 'border-slate-200/60 opacity-80 bg-slate-50/50'
                          : 'border-[#EEF2F6] hover:border-slate-300'
                      }`}
                    >
                      {/* 1. Baris Atas: Info Provider & Toolbar Aksi Lengkap */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            {getProviderBadge(cfg.provider)}

                            <h3 className="text-base font-bold text-[#102B4B] flex items-center gap-2">
                              {cfg.name}
                            </h3>

                            {cfg.is_primary && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
                                <Sparkles className="w-3 h-3" />
                                Provider Utama
                              </span>
                            )}

                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                cfg.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {cfg.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>

                            {getHealthBadge(cfg.last_health_status, cfg.last_health_check_at)}
                          </div>

                          {/* Detail Ringkas: API Key, Timeout, Akumulasi */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">API Key: </span>
                              {cfg.provider === 'mock' ? (
                                <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {cfg.masked_api_key}
                                </span>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  <span
                                    className={`font-mono px-2 py-0.5 rounded text-xs transition ${
                                      revealedKeys[cfg.id]
                                        ? 'text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 select-all'
                                        : 'text-slate-700 bg-slate-100'
                                    }`}
                                  >
                                    {revealedKeys[cfg.id] || cfg.masked_api_key}
                                  </span>

                                  {cfg.has_api_key && (
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (revealedKeys[cfg.id]) {
                                            setRevealedKeys((prev) => {
                                              const copy = { ...prev };
                                              delete copy[cfg.id];
                                              return copy;
                                            });
                                          } else {
                                            requestRevealKey(cfg, 'view');
                                          }
                                        }}
                                        className={`p-1 rounded-md transition ${
                                          revealedKeys[cfg.id]
                                            ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                        }`}
                                        title={
                                          revealedKeys[cfg.id]
                                            ? 'Sembunyikan API Key'
                                            : 'Verifikasi password untuk melihat API Key'
                                        }
                                      >
                                        {revealedKeys[cfg.id] ? (
                                          <EyeOff className="w-3.5 h-3.5" />
                                        ) : (
                                          <Eye className="w-3.5 h-3.5" />
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => requestRevealKey(cfg, 'copy')}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                        title={
                                          revealedKeys[cfg.id]
                                            ? 'Salin API Key ke clipboard'
                                            : 'Verifikasi password untuk menyalin API Key'
                                        }
                                      >
                                        {copiedId === cfg.id ? (
                                          <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="text-slate-400">Timeout: </span>
                              <span className="font-medium text-slate-700">{cfg.timeout}s</span>
                            </div>

                            {cfg.last_used_at && (
                              <div>
                                <span className="text-slate-400">Terakhir Digunakan: </span>
                                <span className="font-medium text-slate-700">
                                  {new Date(cfg.last_used_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                            )}

                            <div>
                              <span className="text-slate-400">Akumulasi: </span>
                              <span className="font-bold text-slate-700">{cfg.total_requests.toLocaleString('id-ID')} calls</span>
                              <span className="text-slate-400 ml-1">({cfg.total_tokens.toLocaleString('id-ID')} tokens)</span>
                            </div>
                          </div>
                        </div>

                        {/* Top-Right Toolbar Aksi */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={testingId === cfg.id}
                            onClick={() => testSavedConfig(cfg)}
                            className="text-xs font-semibold text-slate-700 hover:text-[#1769E0] border-slate-200 h-8 rounded-xl shadow-2xs"
                            title="Uji koneksi ping ke endpoint API ini"
                          >
                            {testingId === cfg.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            )}
                            Test Ping
                          </Button>

                          {!cfg.is_primary && cfg.is_active && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPrimary(cfg)}
                              className="text-xs font-semibold text-blue-700 bg-blue-50/60 hover:bg-blue-100/70 border-blue-200 h-8 rounded-xl"
                              title="Jadikan provider ini sebagai model aktif utama"
                            >
                              Jadikan Utama
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleActive(cfg)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition h-8 ${
                              cfg.is_active
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={cfg.is_active ? 'Nonaktifkan Provider' : 'Aktifkan Provider'}
                          >
                            {cfg.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(cfg)}
                            className="text-xs font-semibold text-slate-700 hover:text-slate-900 border-slate-200 h-8 rounded-xl"
                          >
                            Edit
                          </Button>

                          <button
                            type="button"
                            onClick={() => setResetTarget(cfg)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 border border-slate-200 transition h-8 w-8 flex items-center justify-center"
                            title="Reset hitungan request & token"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(cfg)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200 transition h-8 w-8 flex items-center justify-center"
                            title="Hapus konfigurasi ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 2. DAFTAR MODEL LIST KE BAWAH (LAYOUT TABEL SEPERTI GOOGLE AI STUDIO) */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs px-1">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[#1769E0]" />
                            <span className="font-bold text-[#102B4B]">
                              Model Terdaftar di API Key Ini ({modelList.length} Model Aktif):
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px] hidden sm:inline">
                            Satu API Key otomatis failover jika kuota salah satu model habis
                          </span>
                        </div>

                        {/* Tabel Model List Ke Bawah */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
                          <table className="w-full text-left text-xs min-w-[760px]">
                            <thead className="bg-[#F8FBFE] text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
                              <tr>
                                <th className="py-2.5 px-4 min-w-[200px]">Model</th>
                                <th className="py-2.5 px-4 min-w-[130px] whitespace-nowrap">Category</th>
                                <th className="py-2.5 px-4 min-w-[140px] whitespace-nowrap">RPM (Req/Min)</th>
                                <th className="py-2.5 px-4 min-w-[150px] whitespace-nowrap">TPM (Tokens/Min)</th>
                                <th className="py-2.5 px-4 min-w-[140px] whitespace-nowrap">RPD (Req/Day)</th>
                                <th className="py-2.5 px-4 text-center min-w-[140px] whitespace-nowrap">Status & Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {modelList.map((mName) => {
                                const meta = getModelMeta(mName, cfg.provider);
                                const isCurrentActive = cfg.model === mName;
                                const usage = model_realtime_usage?.[mName] || {
                                  current_rpm: 0,
                                  current_tpm: 0,
                                  today_rpd: isCurrentActive ? cfg.today_requests : 0,
                                  today_tokens: isCurrentActive ? cfg.total_tokens : 0,
                                };

                                const effectiveRpd = Math.max(usage.today_rpd, isCurrentActive ? cfg.today_requests : 0);

                                return (
                                  <tr
                                    key={mName}
                                    className={`transition ${
                                      isCurrentActive ? 'bg-blue-50/40 font-medium' : 'hover:bg-slate-50/60'
                                    }`}
                                  >
                                    {/* Model Name & ID */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
                                        <div>
                                          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                            {meta.name}
                                            {meta.is_recommended && (
                                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Rekomendasi
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                                            {mName}
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    {/* Category */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                                        {meta.category}
                                      </span>
                                    </td>

                                    {/* RPM Gauge */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <GoogleAiGauge
                                        current={usage.current_rpm}
                                        max={meta.rpm}
                                        isUnlimited={meta.rpm <= 0}
                                      />
                                    </td>

                                    {/* TPM Gauge */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <GoogleAiGauge
                                        current={usage.current_tpm}
                                        max={meta.tpm}
                                        formatCompact
                                        isUnlimited={meta.tpm <= 0}
                                      />
                                    </td>

                                    {/* RPD Gauge */}
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <GoogleAiGauge
                                        current={effectiveRpd}
                                        max={meta.rpd}
                                        formatCompact={meta.rpd >= 1000}
                                        isUnlimited={meta.rpd <= 0}
                                      />
                                    </td>

                                    {/* Status & Aksi Switch */}
                                    <td className="py-3 px-4 text-center">
                                      {isCurrentActive ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#1769E0] text-white shadow-xs">
                                          <Star className="w-3 h-3 fill-current" />
                                          <span>Default Aktif</span>
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          disabled={switchingModelId === cfg.id}
                                          onClick={() => handleQuickSwitchModel(cfg, mName)}
                                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-[#1769E0] border border-slate-200 hover:border-blue-300 transition shadow-2xs"
                                          title="Jadikan model ini sebagai model default aktif untuk API key ini"
                                        >
                                          {switchingModelId === cfg.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                          ) : (
                                            <Check className="w-3 h-3 text-slate-400 group-hover:text-[#1769E0]" />
                                          )}
                                          <span>Gunakan Model Ini</span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Catatan / Pesan Error (jika ada) */}
                      {(cfg.notes || cfg.last_error_message) && (
                        <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                          {cfg.notes && (
                            <p className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-block">
                              "{cfg.notes}"
                            </p>
                          )}
                          {cfg.last_error_message && (
                            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{cfg.last_error_message}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MODE ROTASI & ROUTING AI ENGINE */}
          {activeTab === 'routing' && (
            <div className="space-y-6">
              {/* Header Tab Routing */}
              <div className="p-6 rounded-2xl bg-white border border-[#EEF2F6] shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-2xl text-[#1769E0]">
                      <Sliders className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#102B4B]">
                        Pengaturan Mode Rotasi & Routing AI Engine
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tentukan arsitektur bagaimana sistem mengalihkan dan membagi request evaluasi CV, pencocokan lowongan, dan analisis skill gap antar model & provider API.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    disabled={isSavingRouting}
                    onClick={() => handleSaveRoutingSettings()}
                    className="bg-[#1769E0] hover:bg-[#0A57C2] text-white text-xs font-semibold rounded-xl px-5 h-9 shadow-xs flex items-center gap-2"
                  >
                    {isSavingRouting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Simpan Pengaturan Routing</span>
                  </Button>
                </div>
              </div>

              {/* Pilihan 5 Mode Rotasi & Routing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Mode Manual (Single Model) */}
                <div
                  onClick={() => setRoutingForm({ ...routingForm, mode: 'manual' })}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    routingForm.mode === 'manual'
                      ? 'bg-blue-50/50 border-[#1769E0] shadow-sm ring-2 ring-[#1769E0]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={routingForm.mode === 'manual'}
                          onChange={() => setRoutingForm({ ...routingForm, mode: 'manual' })}
                          className="w-4 h-4 text-[#1769E0] focus:ring-[#1769E0]"
                        />
                        <h4 className="font-bold text-sm text-[#102B4B]">1. Mode Manual (Single Model)</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        Fixed Single
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem secara ketat hanya menggunakan 1 model AI spesifik yang dipilih admin. Tidak ada rotasi atau perpindahan otomatis ke model lain.
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div><strong>Kelebihan:</strong> Konsistensi hasil sangat tinggi & hasil benchmarking pasti.</div>
                      <div><strong>Kelemahan:</strong> Jika limit 15 RPM tercapai, sistem tidak dapat failover ke model lain.</div>
                    </div>
                  </div>

                  {routingForm.mode === 'manual' && (
                    <div className="mt-4 pt-3 border-t border-blue-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Pilih Provider:
                        </label>
                        <select
                          value={routingForm.manual_config_id || (configs[0]?.id ?? '')}
                          onChange={(e) => {
                            const cfgId = parseInt(e.target.value);
                            const cfg = configs.find((c) => c.id === cfgId);
                            setRoutingForm({
                              ...routingForm,
                              manual_config_id: cfgId,
                              manual_model: cfg?.model || '',
                            });
                          }}
                          className="w-full text-xs h-8 px-2 rounded-lg border border-slate-200 bg-white"
                        >
                          {configs.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.provider})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          Pilih Model Terkunci:
                        </label>
                        <select
                          value={routingForm.manual_model || ''}
                          onChange={(e) => setRoutingForm({ ...routingForm, manual_model: e.target.value })}
                          className="w-full text-xs h-8 px-2 rounded-lg border border-slate-200 bg-white font-mono"
                        >
                          {(() => {
                            const selectedCfg = configs.find((c) => c.id === routingForm.manual_config_id) || configs[0];
                            const models = selectedCfg?.enabled_models && selectedCfg.enabled_models.length > 0
                              ? selectedCfg.enabled_models
                              : [selectedCfg?.model || 'gemini-1.5-flash'];
                            return models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Mode Rotasi 1 API (Multi-Model 1 Key) */}
                <div
                  onClick={() => setRoutingForm({ ...routingForm, mode: 'single_api_rotation' })}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    routingForm.mode === 'single_api_rotation'
                      ? 'bg-blue-50/50 border-[#1769E0] shadow-sm ring-2 ring-[#1769E0]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={routingForm.mode === 'single_api_rotation'}
                          onChange={() => setRoutingForm({ ...routingForm, mode: 'single_api_rotation' })}
                          className="w-4 h-4 text-[#1769E0] focus:ring-[#1769E0]"
                        />
                        <h4 className="font-bold text-sm text-[#102B4B]">2. Mode Rotasi 1 API (Multi-Model)</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-[#1769E0]">
                        Standar Multi-Model
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Memaksimalkan seluruh model gratis yang terdaftar di 1 API Key (Gemini 2.0 Flash, Flash Lite, 1.5 Flash, 1.5 Flash 8B). Jika model utama mencapai batas kuota, request otomatis dialihkan ke model lain di key yang sama.
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div><strong>Kelebihan:</strong> Cukup 1 API Key, kuota harian kumulatif hingga 6.000 RPD gratis.</div>
                      <div><strong>Kelemahan:</strong> Dibatasi oleh limit akun Google AI Studio tunggal tersebut.</div>
                    </div>
                  </div>
                </div>

                {/* 3. Mode Rotasi Semua API (Multi-Account Pool) */}
                <div
                  onClick={() => setRoutingForm({ ...routingForm, mode: 'all_api_rotation' })}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    routingForm.mode === 'all_api_rotation'
                      ? 'bg-blue-50/50 border-[#1769E0] shadow-sm ring-2 ring-[#1769E0]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={routingForm.mode === 'all_api_rotation'}
                          onChange={() => setRoutingForm({ ...routingForm, mode: 'all_api_rotation' })}
                          className="w-4 h-4 text-[#1769E0] focus:ring-[#1769E0]"
                        />
                        <h4 className="font-bold text-sm text-[#102B4B]">3. Mode Rotasi Semua API (Pool Gabungan)</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                        Multi-Provider Pool
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Menggabungkan SEMUA API Key / Provider aktif ke dalam satu resource pool bersama (misal: Gemini Akun 1, Gemini Akun 2, OpenAI GPT-4o mini). Beban request didistribusikan melintasi seluruh akun.
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div><strong>Kelebihan:</strong> Kapasitas kuota hampir tanpa batas & toleransi kegagalan maksimal.</div>
                      <div><strong>Kelemahan:</strong> Memerlukan minimal 2 API Key/akun yang aktif.</div>
                    </div>
                  </div>
                </div>

                {/* 4. Smart Adaptive Failover (Saran Utama Rekomendasi) */}
                <div
                  onClick={() => setRoutingForm({ ...routingForm, mode: 'smart_failover' })}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    routingForm.mode === 'smart_failover'
                      ? 'bg-emerald-50/60 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={routingForm.mode === 'smart_failover'}
                          onChange={() => setRoutingForm({ ...routingForm, mode: 'smart_failover' })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-600"
                        />
                        <h4 className="font-bold text-sm text-emerald-900">4. Smart Adaptive Failover</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Rekomendasi Terbaik
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem selalu menggunakan <strong>Model Utama Terbaik</strong> untuk akurasi optimal. Rotasi HANYA terjadi secara adaptif ketika sistem mendeteksi error HTTP 429 (Rate Limit), kuota harian habis, atau latensi tinggi.
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div><strong>Kelebihan:</strong> Kualitas output selalu prima; rotasi tidak dilakukan sembarangan jika kondisi normal.</div>
                      <div><strong>Kelemahan:</strong> Model cadangan hanya bekerja saat kondisi darurat limit.</div>
                    </div>
                  </div>
                </div>

                {/* 5. Mode Hemat Kuota & Kecepatan (High-Throughput) */}
                <div
                  onClick={() => setRoutingForm({ ...routingForm, mode: 'quota_saver' })}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    routingForm.mode === 'quota_saver'
                      ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="routing_mode"
                          checked={routingForm.mode === 'quota_saver'}
                          onChange={() => setRoutingForm({ ...routingForm, mode: 'quota_saver' })}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-600"
                        />
                        <h4 className="font-bold text-sm text-amber-900">5. Mode Hemat Kuota & Kecepatan</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                        Saran Traffic Tinggi
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Memprioritaskan model dengan kuota RPM tertinggi (seperti <strong>Gemini 2.0 Flash Lite dengan 30 RPM</strong>) terlebih dahulu untuk meminimalkan antrean panggilan saat banyak pelamar mengakses bersamaan.
                    </p>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div><strong>Kelebihan:</strong> Bebas hambatan rate limit per menit, latensi ultra-cepat (~800ms).</div>
                      <div><strong>Kelemahan:</strong> Model penalaran kompleks (seperti Pro) disimpan di urutan terakhir.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pengaturan Parameter Strategi Rotasi & Fallback Safety */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strategi Distribusi Panggilan */}
                <div className="bg-white p-5 rounded-2xl border border-[#EEF2F6] shadow-xs space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#102B4B] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1769E0]" />
                      <span>Strategi Distribusi Panggilan</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bagaimana antrean request dibagi saat mode rotasi aktif.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                        routingForm.strategy === 'failover'
                          ? 'bg-blue-50/50 border-[#1769E0]'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="routing_strategy"
                        checked={routingForm.strategy === 'failover'}
                        onChange={() => setRoutingForm({ ...routingForm, strategy: 'failover' })}
                        className="w-4 h-4 text-[#1769E0] mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Priority Failover (Berurutan)</div>
                        <div className="text-[11px] text-slate-500">
                          Panggil model/API prioritas pertama terus menerus. Beralih ke kandidat kedua HANYA saat terkena limit 429 atau kuota habis.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                        routingForm.strategy === 'round_robin'
                          ? 'bg-blue-50/50 border-[#1769E0]'
                          : 'bg-slate-50/60 border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="routing_strategy"
                        checked={routingForm.strategy === 'round_robin'}
                        onChange={() => setRoutingForm({ ...routingForm, strategy: 'round_robin' })}
                        className="w-4 h-4 text-[#1769E0] mt-0.5"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">Round-Robin (Beban Seimbang)</div>
                        <div className="text-[11px] text-slate-500">
                          Setiap panggilan baru memanggil model/API berikutnya secara bergantian agar beban kuota RPM per menit tidak menumpuk di 1 model saja.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pengaman Sistem: Mock Fallback Guarantee */}
                <div className="bg-white p-5 rounded-2xl border border-[#EEF2F6] shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[#102B4B] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Zero-Downtime Fallback Safety Guard</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Jika seluruh API eksternal (Google/OpenAI) kehabisan kuota atau server provider sedang *down*, sistem dapat mengaktifkan algoritma pencocokan Mock Heuristic lokal Profabel secara otomatis agar pelamar tidak melihat error 500.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={routingForm.allow_mock_fallback}
                        onChange={(e) => setRoutingForm({ ...routingForm, allow_mock_fallback: e.target.checked })}
                        className="w-4 h-4 text-[#1769E0] rounded focus:ring-[#1769E0]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Aktifkan Mock Heuristic Fallback (Direkomendasikan)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Menjamin aplikasi tetap berfungsi 100% dan respon tetap diterima oleh pelamar kerja.
                        </span>
                      </div>
                    </label>
                  </div>

                  <Button
                    type="button"
                    disabled={isSavingRouting}
                    onClick={() => handleSaveRoutingSettings()}
                    className="w-full bg-[#1769E0] hover:bg-[#0A57C2] text-white text-xs font-semibold rounded-xl h-9"
                  >
                    {isSavingRouting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    ) : (
                      <Check className="w-4 h-4 mr-1.5" />
                    )}
                    Simpan Seluruh Pengaturan Mode AI
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CALL LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EEF2F6] shadow-xs">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Cari berdasarkan nama user, provider, model, atau error..."
                      value={searchLog}
                      onChange={(e) => setSearchLog(e.target.value)}
                      className="pl-9 text-xs h-9 rounded-xl bg-slate-50/50"
                    />
                  </div>

                  <select
                    value={logFilterAction}
                    onChange={(e) => setLogFilterAction(e.target.value)}
                    className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
                  >
                    <option value="all">Semua Aksi</option>
                    <option value="job_match">Job Matching</option>
                    <option value="skill_gap">Skill Gap</option>
                    <option value="cv_review">Evaluasi ATS CV</option>
                    <option value="health_check">Health Check</option>
                  </select>

                  <select
                    value={logFilterStatus}
                    onChange={(e) => setLogFilterStatus(e.target.value)}
                    className="text-xs h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700"
                  >
                    <option value="all">Semua Status</option>
                    <option value="success">Sukses</option>
                    <option value="failed">Gagal</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Menampilkan {filteredLogs.length} dari {recentLogs.length} log
                  </span>

                  {recentLogs.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsClearingLogs(true)}
                      className="text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Bersihkan Log
                    </Button>
                  )}
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-2xl border border-[#EEF2F6] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FBFE] text-slate-500 border-b border-[#EEF2F6] font-semibold">
                      <tr>
                        <th className="py-3 px-4">Waktu</th>
                        <th className="py-3 px-4">Fitur / Aksi</th>
                        <th className="py-3 px-4">Pengguna</th>
                        <th className="py-3 px-4">Provider & Model</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Latensi</th>
                        <th className="py-3 px-4 text-right">Token</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF2F6]">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="font-medium">Belum ada riwayat panggilan AI yang cocok.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(log.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              <span className="capitalize">{log.action_type.replace('_', ' ')}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-700">{log.user_name}</div>
                              {log.user_email && (
                                <div className="text-[11px] text-slate-400">{log.user_email}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {log.provider}
                                </span>
                                <span className="font-mono text-slate-600">{log.model}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {log.status === 'success' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3" /> Sukses
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-pointer"
                                  title={log.error_message || 'Terjadi kegagalan'}
                                >
                                  <AlertTriangle className="w-3 h-3" /> Gagal
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                              {log.response_time_ms} ms
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                              {log.total_tokens.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTATION & RATE LIMIT ARCHITECTURE */}
          {activeTab === 'docs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#EEF2F6] space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 text-[#1769E0]">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#102B4B]">
                    Spesifikasi Resmi Rate Limit Google AI Studio
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Berdasarkan arsitektur Google AI Studio, setiap model AI memiliki kuota independen meskipun menggunakan 1 API Key yang sama:
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">1. Category: Text-out models</div>
                    <p className="text-slate-600">
                      Model terbaik untuk evaluasi JSON, pencocokan lowongan, dan analisis CV ATS. Memiliki kuota 15-30 RPM, 250K-1M TPM, dan hingga 1.500 RPD per model.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-800">2. Category: Live API (Unlimited RPM/RPD)</div>
                    <p className="text-slate-600">
                      Dirancang untuk komunikasi audio dua arah / WebSocket interaktif secara realtime. Memiliki status RPM dan RPD Unlimited namun dibatasi TPM input.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#EEF2F6] space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5 text-emerald-600">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#102B4B]">
                    Rotasi Cerdas & Failover Antar-Model
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Profabel mengimplementasikan fitur <strong>1 API Key Menaungi Banyak Model</strong>:
                </p>
                <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <li>
                    <strong>Satu API Key, Multi-Model:</strong> Anda cukup memasukkan 1 API Key, lalu mencentang model-model yang ingin diaktifkan (misal: Gemini 2.0 Flash, 1.5 Flash, 1.5 Flash 8B).
                  </li>
                  <li>
                    <strong>Anti-Habis Kuota (Auto-Failover):</strong> Jika kuota model pertama terkena Rate Limit 429 atau kuota harian habis, sistem langsung mengalihkan request secara otomatis ke model berikutnya yang terdaftar di API Key tersebut.
                  </li>
                  <li>
                    <strong>Ganti Model Instan:</strong> Anda dapat mengganti model aktif kapan saja dengan 1 klik tombol bintang di kartu provider tanpa perlu memasukkan ulang API key.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE / EDIT AI PROVIDER */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className="w-[95vw] sm:max-w-[1240px] !max-w-[1240px] max-h-[94vh] overflow-y-auto rounded-2xl p-6 sm:p-8"
          style={{ maxWidth: '1240px', width: '95vw' }}
        >
          <DialogHeader className="pb-2 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-[#102B4B] flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#1769E0]" />
              <span>{isEditing ? 'Edit Konfigurasi Provider AI' : 'Tambah Provider AI Baru'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEditing
                ? 'Perbarui API Key, atur model aktif, dan sesuaikan parameter batasan request.'
                : 'Form dimulai dalam keadaan bersih. Masukkan detail konfigurasi atau API Key untuk mendeteksi model.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-6 pt-2">
            {/* 1. Nama & Tipe Provider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="cfg_name" className="text-xs font-semibold text-slate-700">
                  Nama Konfigurasi <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cfg_name"
                  required
                  placeholder="Misal: Google Gemini Multi-Model Production"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg_provider" className="text-xs font-semibold text-slate-700">
                  Tipe Provider <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="cfg_provider"
                  value={formData.provider}
                  onChange={(e) => {
                    const nextProv = e.target.value as AiConfigItem['provider'];
                    setFormData({
                      ...formData,
                      provider: nextProv,
                      base_url:
                        nextProv === 'gemini'
                          ? 'https://generativelanguage.googleapis.com/v1beta'
                          : nextProv === 'openai'
                          ? 'https://api.openai.com/v1'
                          : formData.base_url,
                      model: '',
                      enabled_models: [],
                    });
                    setAvailableModels(catalog_models.filter((m) => m.provider === nextProv));
                  }}
                  className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-[#1769E0]/20"
                >
                  <option value="gemini">Google Gemini API (AI Studio)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="anthropic">Anthropic Claude</option>
                  <option value="custom">Custom OpenAI-Compatible LLM</option>
                  <option value="mock">Local Mock Engine (Offline)</option>
                </select>
              </div>
            </div>

            {/* 2. API Key Section with Live Sync Detect Button */}
            {formData.provider !== 'mock' && (
              <div className="space-y-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cfg_api_key" className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#1769E0]" />
                    <span>API Key {isEditing ? '(Kosongkan jika tidak ingin mengubah)' : '*'}</span>
                  </Label>
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Enkripsi AES-256
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="cfg_api_key"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={
                        isEditing
                          ? 'Kunci API tersimpan aman. Ketik kunci baru jika ingin memperbarui...'
                          : 'Tempel API Key dari Google AI Studio atau OpenAI...'
                      }
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      className="text-xs h-10 rounded-xl pr-10 font-mono bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Tombol Deteksi Model Otomatis dari API Key (Live Sync) */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLiveFetchModels}
                    disabled={isFetchingModels}
                    className="shrink-0 bg-white text-[#1769E0] hover:bg-blue-50 border-blue-200 text-xs font-semibold h-10 rounded-xl px-4 flex items-center gap-1.5 shadow-xs"
                    title="Hubungi endpoint resmi provider untuk memverifikasi model aktif untuk API key ini"
                  >
                    {isFetchingModels ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    )}
                    <span>Deteksi Model Live Sync</span>
                  </Button>
                </div>

                {fetchNotice && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                      fetchNotice.isLive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{fetchNotice.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Pilihan Model AI Realtime & Multi-Model Table (1 API Key = Banyak Model) */}
            <div className="space-y-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-[#102B4B] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#1769E0]" />
                    <span>Pilihan Model AI (Multi-Model per API Key)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Centang satu atau beberapa model yang dinaungi oleh 1 API Key ini. Pilih salah satu sebagai <strong>Default Aktif</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Category Filter */}
                  {uniqueCategories.length > 1 && (
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="text-[11px] h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
                    >
                      <option value="all">Semua Kategori</option>
                      {uniqueCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Search Filter */}
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari model..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="text-[11px] h-8 pl-8 pr-2 w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Models List Table Ke Bawah (Lebar dan Readable di Layar PC) */}
              <div className="max-h-80 overflow-y-auto overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-left text-xs min-w-[860px]">
                  <thead className="bg-[#F8FBFE] text-slate-600 border-b border-slate-200 font-semibold text-[11px] sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">Pilih</th>
                      <th className="py-3 px-4 min-w-[220px]">Model</th>
                      <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">Category</th>
                      <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">RPM (Req/Min)</th>
                      <th className="py-3 px-3 min-w-[150px] whitespace-nowrap">TPM (Tokens/Min)</th>
                      <th className="py-3 px-3 min-w-[140px] whitespace-nowrap">RPD (Req/Day)</th>
                      <th className="py-3 px-3 min-w-[130px] text-center whitespace-nowrap">Default Aktif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalCatalogFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-xs text-slate-400">
                          Tidak ada model yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      modalCatalogFiltered.map((m) => {
                        const isChecked = formData.enabled_models.includes(m.id);
                        const isDefault = formData.model === m.id;
                        const modalUsage = model_realtime_usage?.[m.id] || {
                          current_rpm: 0,
                          current_tpm: 0,
                          today_rpd: 0,
                          today_tokens: 0,
                        };

                        return (
                          <tr
                            key={m.id}
                            className={`transition ${
                              isDefault
                                ? 'bg-blue-50/50 font-medium'
                                : isChecked
                                ? 'bg-slate-50/70'
                                : 'hover:bg-slate-50/40'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleModelSelection(m)}
                                className="rounded text-[#1769E0] focus:ring-[#1769E0] w-4 h-4 cursor-pointer"
                              />
                            </td>

                            <td className="py-2.5 px-4">
                              <div>
                                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                  {m.name}
                                  {m.is_recommended && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Rekomendasi
                                    </span>
                                  )}
                                  {m.is_live_detected && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      Live
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                                  {m.id}
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                                {m.category}
                              </span>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <GoogleAiGauge
                                current={modalUsage.current_rpm}
                                max={m.rpm}
                                isUnlimited={m.rpm <= 0}
                              />
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <GoogleAiGauge
                                current={modalUsage.current_tpm}
                                max={m.tpm}
                                formatCompact
                                isUnlimited={m.tpm <= 0}
                              />
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <GoogleAiGauge
                                current={modalUsage.today_rpd}
                                max={m.rpd}
                                formatCompact={m.rpd >= 1000}
                                isUnlimited={m.rpd <= 0}
                              />
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {isDefault ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-[#1769E0] text-white shadow-xs">
                                  <Star className="w-3 h-3 fill-current" />
                                  Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setModelAsDefault(m)}
                                  className="text-[11px] text-slate-600 hover:text-[#1769E0] hover:bg-white px-2.5 py-1 rounded-md border border-slate-200 transition font-medium"
                                >
                                  Pilih Default
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Status Ringkasan Model Terpilih */}
              <div className="flex flex-wrap items-center justify-between text-xs pt-2 text-slate-600">
                <div>
                  <span>Model Default Aktif: </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {formData.model ? formData.model : 'Belum dipilih'}
                  </span>
                </div>
                <div>
                  <span>Total Model Aktif di Key Ini: </span>
                  <span className="font-bold text-[#1769E0]">
                    {formData.enabled_models.length} model
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Limits & Parameters (Auto Synced or Custom) */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#102B4B] block">
                  Batas Kuota & Parameter Panggilan:
                </span>
                <span className="text-[11px] text-slate-500">
                  (Otomatis diselaraskan dengan spesifikasi model default)
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Batas Harian (RPD / Calls)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="1500 (0=unlimited)"
                    value={formData.daily_request_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_request_limit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="text-xs h-8 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Rate Limit (RPM)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="15"
                    value={formData.rate_limit_rpm}
                    onChange={(e) =>
                      setFormData({ ...formData, rate_limit_rpm: parseInt(e.target.value) || 0 })
                    }
                    className="text-xs h-8 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">TPM Limit (Tokens/Min)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="250000"
                    value={formData.tpm_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, tpm_limit: parseInt(e.target.value) || 0 })
                    }
                    className="text-xs h-8 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Timeout (Detik)</Label>
                  <Input
                    type="number"
                    min="3"
                    max="120"
                    placeholder="20"
                    value={formData.timeout}
                    onChange={(e) =>
                      setFormData({ ...formData, timeout: parseInt(e.target.value) || 20 })
                    }
                    className="text-xs h-8 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#1769E0] focus:ring-[#1769E0] w-4 h-4"
                />
                <span>Aktifkan Provider Ini</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#1769E0]">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded text-[#1769E0] focus:ring-[#1769E0] w-4 h-4"
                />
                <span>Jadikan Provider Utama (Primary Driver)</span>
              </label>
            </div>

            {/* Catatan Administrator */}
            <div className="space-y-1.5">
              <Label htmlFor="cfg_notes" className="text-xs font-semibold text-slate-700">
                Catatan Administrator (Opsional)
              </Label>
              <Input
                id="cfg_notes"
                placeholder="Misal: API Key utama produksi untuk evaluasi resume & asisten karir..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="text-xs h-9 rounded-xl"
              />
            </div>

            {/* Live Test Feedback inside modal */}
            {formTestResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  formTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {formTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{formTestResult.message}</span>
                </div>
                {formTestResult.latency_ms && (
                  <span className="font-semibold text-emerald-700">
                    {formTestResult.latency_ms} ms
                  </span>
                )}
              </div>
            )}

            {/* Password Verification for Edit */}
            {isEditing && (
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Verifikasi Password Admin (Wajib untuk Menyimpan)</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Untuk mengonfirmasi perubahan konfigurasi sistem AI, masukkan password akun admin Anda.
                </p>
                <div className="relative pt-1">
                  <Input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik password admin Anda..."
                    value={formData.admin_password}
                    onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                    className="text-xs h-9 rounded-xl pr-10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <DialogFooter className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={formTesting}
                onClick={testFormConnection}
                className="text-xs font-semibold text-slate-700 hover:text-[#1769E0]"
              >
                {formTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                )}
                Uji Koneksi (Test Ping)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#1769E0] hover:bg-[#0A57C2] text-white font-semibold text-xs rounded-xl px-4"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambahkan Provider'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: RESET STATS CONFIRMATION */}
      <Dialog open={!!resetTarget} onOpenChange={() => setResetTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#102B4B] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <span>Reset Statistik Penggunaan?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tindakan ini akan mengembalikan total request, token, dan kegagalan pada provider{' '}
              <strong>"{resetTarget?.name}"</strong> ke angka 0. Log panggilan historis tetap tersimpan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetTarget(null)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleResetStats}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
            >
              Ya, Reset Statistik
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: DELETE CONFIRMATION (WITH ADMIN PASSWORD VERIFICATION) */}
      <Dialog open={!!deleteTarget} onOpenChange={() => { setDeleteTarget(null); setDeletePassword(''); }}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Hapus Konfigurasi Provider AI?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Apakah Anda yakin ingin menghapus <strong>"{deleteTarget?.name}"</strong>? Jika ini
              provider utama, sistem akan otomatis mengalihkan status utama ke provider aktif lain.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteConfig} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Verifikasi Password Admin (Wajib)</span>
              </Label>
              <div className="relative">
                <Input
                  type={showDeletePassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik password admin Anda..."
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="text-xs h-9 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setDeleteTarget(null); setDeletePassword(''); }}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
              >
                Konfirmasi Hapus
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: CLEAR ALL LOGS CONFIRMATION */}
      <Dialog open={isClearingLogs} onOpenChange={setIsClearingLogs}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Bersihkan Seluruh Riwayat Log AI?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Semua {recentLogs.length} riwayat log pemanggilan AI (matching, skill gap, review CV)
              akan dihapus dari basis data. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClearingLogs(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleClearLogs}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
            >
              Ya, Bersihkan Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: SECURITY PASSWORD VERIFICATION FOR VIEWING / COPYING API KEY */}
      <Dialog open={isSecurityModalOpen} onOpenChange={setIsSecurityModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#102B4B] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1769E0]" />
              <span>Verifikasi Keamanan Akses Kunci API</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Untuk {securityAction === 'copy' ? 'menyalin' : 'melihat'} kunci API untuk provider{' '}
              <strong>"{verifyingConfig?.name}"</strong>, silakan ketik password akun administrator
              Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSecurityVerify} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Password Akun Admin Anda <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="Ketik password admin..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="text-xs h-9 rounded-xl pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {securityError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSecurityModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isVerifyingPassword}
                className="bg-[#1769E0] hover:bg-[#0A57C2] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 px-4"
              >
                {isVerifyingPassword ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                )}
                Verifikasi & {securityAction === 'copy' ? 'Salin Kunci' : 'Tampilkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
