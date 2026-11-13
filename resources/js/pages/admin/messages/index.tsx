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
import { Head, Link, router } from '@inertiajs/react';
import {
  AlertCircle,
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  Megaphone,
  MessageSquare,
  Radio,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'pelamar' | 'perusahaan';
  role_label: string;
  avatar?: string | null;
}

interface MessageItem {
  id: string;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  recipient_id: number;
  recipient_name: string;
  subject?: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
}

interface ConversationItem {
  id: string;
  user: UserItem;
  last_message: string;
  last_message_at: string;
  last_message_time_ago: string;
  unread_count: number;
  messages_count: number;
}

interface AnnouncementItem {
  id: string;
  admin_id?: number;
  sender_name?: string;
  target: 'all' | 'pelamar' | 'perusahaan';
  target_label: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  recipient_count: number;
  created_at: string;
  time_ago: string;
}

interface Props {
  conversations: ConversationItem[];
  activeConversation: { id: string; user: UserItem } | null;
  messages: MessageItem[];
  announcements: AnnouncementItem[];
  users: UserItem[];
  counts: {
    total_conversations: number;
    unread_messages: number;
    total_announcements: number;
    total_recipients: number;
    total_users: number;
    pelamar_count: number;
    perusahaan_count: number;
  };
}

export default function AdminMessagesIndex({
  conversations = [],
  activeConversation,
  messages = [],
  announcements = [],
  users = [],
  counts = {
    total_conversations: 0,
    unread_messages: 0,
    total_announcements: 0,
    total_recipients: 0,
    total_users: 0,
    pelamar_count: 0,
    perusahaan_count: 0,
  },
}: Props): ReactElement {
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');

  // Search & filter for conversation list
  const [chatSearch, setChatSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'pelamar' | 'perusahaan' | 'unread'>('all');

  // Chat message input
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Modal: Kirim Pesan Personal
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [personalRecipientId, setPersonalRecipientId] = useState<string>('');
  const [personalSubject, setPersonalSubject] = useState('');
  const [personalBody, setPersonalBody] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSendingPersonal, setIsSendingPersonal] = useState(false);

  // Modal: Buat Pengumuman
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTarget, setAnnouncementTarget] = useState<'all' | 'pelamar' | 'perusahaan'>('all');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);

  // Auto scroll to latest message in chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.user.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.user.email.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.last_message.toLowerCase().includes(chatSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (roleFilter === 'pelamar') return c.user.role === 'pelamar';
    if (roleFilter === 'perusahaan') return c.user.role === 'perusahaan';
    if (roleFilter === 'unread') return c.unread_count > 0;
    return true;
  });

  // Filtered users for modal recipient selector
  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role_label.toLowerCase().includes(q)
    );
  });

  // Handle select conversation
  const handleSelectConversation = (conv: ConversationItem): void => {
    router.get(
      '/admin/messages',
      { user_id: conv.user.id },
      { preserveState: true, replace: true }
    );
  };

  // Handle send message in active conversation
  const handleSendChatMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    router.post(
      '/admin/messages/direct',
      {
        recipient_id: activeConversation.user.id,
        body: messageInput.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setMessageInput('');
          setIsSending(false);
        },
        onError: () => {
          setIsSending(false);
        },
      }
    );
  };

  // Handle submit Personal Message Modal
  const handleSendPersonalMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (!personalRecipientId || !personalBody.trim() || isSendingPersonal) return;

    setIsSendingPersonal(true);
    router.post(
      '/admin/messages/direct',
      {
        recipient_id: Number(personalRecipientId),
        subject: personalSubject.trim() || null,
        body: personalBody.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowPersonalModal(false);
          setPersonalRecipientId('');
          setPersonalSubject('');
          setPersonalBody('');
          setIsSendingPersonal(false);
          setActiveTab('chat');
        },
        onError: () => {
          setIsSendingPersonal(false);
        },
      }
    );
  };

  // Handle submit Announcement Modal
  const handleSendAnnouncement = (e: FormEvent): void => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim() || isSendingAnnouncement) return;

    setIsSendingAnnouncement(true);
    router.post(
      '/admin/messages/announcement',
      {
        target: announcementTarget,
        priority: announcementPriority,
        title: announcementTitle.trim(),
        content: announcementContent.trim(),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowAnnouncementModal(false);
          setAnnouncementTitle('');
          setAnnouncementContent('');
          setIsSendingAnnouncement(false);
          setActiveTab('announcements');
        },
        onError: () => {
          setIsSendingAnnouncement(false);
        },
      }
    );
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = (id: string): void => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      router.delete(`/admin/messages/announcement/${id}`, { preserveScroll: true });
    }
  };

  // Quick reply template insert
  const insertTemplate = (text: string): void => {
    setMessageInput(text);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <AdminLayout>
      <Head title="Pusat Pesan & Pengumuman - AKSARA" />

      <div className="min-h-screen bg-[#F8FBFE] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#102B4B] sm:text-3xl">
                Pusat Pesan & Pengumuman
              </h1>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Kirim pesan personal langsung ke pengguna atau siarkan pengumuman resmi ke seluruh pelamar dan perusahaan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                onClick={() => setShowPersonalModal(true)}
                className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-[#102B4B] shadow-sm hover:bg-slate-50 hover:border-slate-300"
              >
                <Mail className="h-4 w-4 text-[#1769E0]" />
                Kirim Pesan Personal
              </Button>

              <Button
                type="button"
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#1769E0] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1254B5]"
              >
                <Megaphone className="h-4 w-4" />
                Siarkan Pengumuman
              </Button>
            </div>
          </div>

          {/* 4 Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Percakapan */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Percakapan Personal</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.total_conversations}</p>
                <p className="mt-1 text-[11px] text-slate-400">Pengguna terhubung</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1769E0]">
                <MessageSquare className="h-6 w-6" />
              </div>
            </article>

            {/* Card 2: Pesan Belum Dibaca */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Pesan Belum Dibaca</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#102B4B]">{counts.unread_messages}</span>
                  {counts.unread_messages > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      Perlu Respon
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">Pesan masuk dari pengguna</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Mail className="h-6 w-6" />
              </div>
            </article>

            {/* Card 3: Total Pengumuman */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Pengumuman Disiarkan</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.total_announcements}</p>
                <p className="mt-1 text-[11px] text-slate-400">Siaran aktif</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Megaphone className="h-6 w-6" />
              </div>
            </article>

            {/* Card 4: Total Penerima Terjangkau */}
            <article className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-500">Penerima Siaran</p>
                <p className="mt-2 text-2xl font-black text-[#102B4B]">{counts.total_users}</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {counts.pelamar_count} Pelamar • {counts.perusahaan_count} Perusahaan
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
            </article>
          </div>

          {/* Navigation Tabs */}
          <nav
            className="flex border-b border-slate-200 text-xs font-bold"
            aria-label="Navigasi Pesan dan Pengumuman"
          >
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
                activeTab === 'chat'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Percakapan Personal</span>
              {counts.unread_messages > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] text-white">
                  {counts.unread_messages}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 transition ${
                activeTab === 'announcements'
                  ? 'border-[#1769E0] text-[#1769E0]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Riwayat Pengumuman Siaran</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {counts.total_announcements}
              </span>
            </button>
          </nav>

          {/* TAB 1: PERCAKAPAN PERSONAL */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[620px]">
              {/* Left Column: Conversation List */}
              <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari pengguna atau pesan..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="h-10 rounded-xl pl-10 text-xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'pelamar', label: 'Pelamar' },
                    { id: 'perusahaan', label: 'Perusahaan' },
                    { id: 'unread', label: 'Belum Dibaca' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setRoleFilter(p.id as any)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        roleFilter === p.id
                          ? 'bg-[#1769E0] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* List Items */}
                <div className="mt-3 flex-1 space-y-1.5 overflow-y-auto max-h-[500px]">
                  {filteredConversations.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Mail className="mx-auto h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="mt-2 text-xs font-medium">Tidak ada percakapan ditemukan</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPersonalModal(true)}
                        className="mt-3 rounded-xl text-xs font-bold text-[#1769E0]"
                      >
                        Mulai Pesan Baru
                      </Button>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const isSelected = activeConversation?.user?.id === conv.user.id;
                      const roleBadgeBg =
                        conv.user.role === 'pelamar'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-purple-50 text-purple-700';

                      return (
                        <div
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 transition ${
                            isSelected
                              ? 'bg-blue-50/70 border border-blue-200 shadow-xs'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Avatar */}
                          <div className="relative">
                            {conv.user.avatar ? (
                              <img
                                src={conv.user.avatar}
                                alt={conv.user.name}
                                className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101B4D] text-xs font-bold text-white">
                                {getInitials(conv.user.name)}
                              </div>
                            )}
                            {conv.unread_count > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="truncate text-xs font-bold text-[#102B4B]">
                                {conv.user.name}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {conv.last_message_time_ago}
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className={`rounded-sm px-1.5 py-0.2 text-[9px] font-bold ${roleBadgeBg}`}>
                                {conv.user.role === 'pelamar' ? 'Pelamar' : 'Perusahaan'}
                              </span>
                              <p className="truncate text-[11px] text-slate-500 leading-snug">
                                {conv.last_message || 'Belum ada pesan'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Chat Box */}
              <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-8 overflow-hidden">
                {!activeConversation ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-slate-400">
                    <MessageSquare className="h-12 w-12 text-slate-300 stroke-[1.2]" />
                    <h3 className="mt-3 text-sm font-bold text-[#102B4B]">
                      Pilih Percakapan
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 max-w-sm">
                      Pilih salah satu percakapan di kolom kiri atau tekan tombol &quot;Kirim Pesan Personal&quot; untuk memulai komunikasi baru.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowPersonalModal(true)}
                      className="mt-4 rounded-xl bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
                    >
                      Kirim Pesan Personal Baru
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
                      <div className="flex items-center gap-3.5">
                        {activeConversation.user.avatar ? (
                          <img
                            src={activeConversation.user.avatar}
                            alt={activeConversation.user.name}
                            className="h-11 w-11 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#101B4D] text-xs font-bold text-white">
                            {getInitials(activeConversation.user.name)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-[#102B4B]">
                              {activeConversation.user.name}
                            </h2>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                activeConversation.user.role === 'pelamar'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-purple-50 text-purple-700'
                              }`}
                            >
                              {activeConversation.user.role_label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {activeConversation.user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/admin/users?search=${encodeURIComponent(activeConversation.user.name)}`}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <span>Lihat Profil</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-[#F8FBFE]/60 max-h-[460px]">
                      {messages.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                          <p className="text-xs">
                            Belum ada riwayat pesan dengan {activeConversation.user.name}.
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Ketik pesan di bawah ini untuk memulai percakapan resmi.
                          </p>
                        </div>
                      ) : (
                        messages.map((m) => {
                          const isAdminSender = m.sender_role === 'admin';

                          return (
                            <div
                              key={m.id}
                              className={`flex flex-col ${isAdminSender ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                                <span className="font-bold text-slate-600">
                                  {isAdminSender ? 'Administrator AKSARA' : m.sender_name}
                                </span>
                                <span>•</span>
                                <span>{m.time_ago}</span>
                              </div>

                              <div
                                className={`rounded-2xl p-4 text-xs leading-relaxed max-w-lg shadow-xs ${
                                  isAdminSender
                                    ? 'rounded-tr-xs bg-[#1769E0] text-white shadow-[0_2px_8px_rgba(23,105,224,0.15)]'
                                    : 'rounded-tl-xs bg-white text-slate-800 border border-slate-100'
                                }`}
                              >
                                {m.subject && (
                                  <p className="font-bold border-b pb-1.5 mb-1.5 opacity-90">
                                    Subjek: {m.subject}
                                  </p>
                                )}
                                <p className="whitespace-pre-line">{m.body}</p>
                              </div>

                              {isAdminSender && (
                                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400 px-1">
                                  {m.is_read ? (
                                    <span className="flex items-center gap-0.5 text-blue-600 font-semibold">
                                      <CheckCheck className="h-3 w-3" /> Dibaca
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <Check className="h-3 w-3" /> Terkirim
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Response Templates */}
                    <div className="border-t border-slate-100 bg-white px-5 py-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Templat Tanggapan Cepat:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Mohon segera melengkapi dokumen verifikasi legalitas perusahaan Anda.',
                          'Akun dan profil Anda telah berhasil diverifikasi oleh tim AKSARA.',
                          'Terima kasih telah menghubungi kami. Kami akan meninjau kendala Anda secepatnya.',
                          'Lowongan pekerjaan Anda telah kami tinjau dan aktif di platform AKSARA.',
                        ].map((tpl) => (
                          <button
                            key={tpl}
                            type="button"
                            onClick={() => insertTemplate(tpl)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600 hover:border-[#1769E0] hover:bg-blue-50 hover:text-[#1769E0] transition truncate max-w-[280px]"
                          >
                            {tpl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Form */}
                    <form
                      onSubmit={handleSendChatMessage}
                      className="border-t border-slate-100 bg-white p-4 flex items-center gap-3"
                    >
                      <textarea
                        rows={1}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage(e);
                          }
                        }}
                        placeholder={`Tulis pesan untuk ${activeConversation.user.name}... (Tekan Enter untuk mengirim)`}
                        className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] outline-none"
                      />

                      <Button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="h-11 w-11 shrink-0 rounded-xl bg-[#1769E0] text-white hover:bg-[#1254B5] disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT PENGUMUMAN */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1769E0] text-white shadow-sm">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#102B4B]">
                      Pengumuman Siaran Platform AKSARA
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pengumuman yang Anda buat akan langsung terkirim ke pesan masuk serta lonceng notifikasi pengguna yang ditargetkan.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowAnnouncementModal(true)}
                  className="rounded-xl bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
                >
                  <Megaphone className="mr-1.5 h-4 w-4" />
                  Buat Pengumuman Baru
                </Button>
              </div>

              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
                  <Megaphone className="h-12 w-12 text-slate-300 stroke-[1.2]" />
                  <h3 className="mt-3 text-base font-bold text-[#102B4B]">
                    Belum Ada Pengumuman
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    Gunakan fitur siaran untuk mengirimkan info resmi, pembaruan sistem, atau tips karir ke seluruh pelamar atau perusahaan.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setShowAnnouncementModal(true)}
                    className="mt-4 rounded-xl bg-[#1769E0] text-xs font-bold text-white"
                  >
                    Siarkan Pengumuman Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {announcements.map((anc) => {
                    const targetBadgeBg =
                      anc.target === 'all'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : anc.target === 'pelamar'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                    const priorityBadgeBg =
                      anc.priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : anc.priority === 'important'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    const priorityLabel =
                      anc.priority === 'urgent'
                        ? 'Pengumuman Resmi / Mendesak'
                        : anc.priority === 'important'
                        ? 'Penting'
                        : 'Informasi Biasa';

                    return (
                      <article
                        key={anc.id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${targetBadgeBg}`}
                              >
                                Target: {anc.target_label}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${priorityBadgeBg}`}
                              >
                                {priorityLabel}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock className="h-3 w-3" /> {anc.time_ago}
                              </span>
                            </div>

                            <h2 className="text-base font-bold text-[#102B4B]">
                              {anc.title}
                            </h2>
                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                              {anc.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            <span className="flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
                              <Users className="h-3.5 w-3.5 text-[#1769E0]" />
                              {anc.recipient_count} Penerima
                            </span>

                            <button
                              type="button"
                              onClick={() => handleDeleteAnnouncement(anc.id)}
                              title="Hapus Pengumuman"
                              aria-label="Hapus Pengumuman"
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: KIRIM PESAN PERSONAL */}
      <Dialog open={showPersonalModal} onOpenChange={setShowPersonalModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">
              Kirim Pesan Personal
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kirim pesan langsung ke pelamar disabilitas atau perusahaan terdaftar di AKSARA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendPersonalMessage} className="space-y-4 py-2 text-xs">
            {/* Recipient Selection */}
            <div>
              <Label htmlFor="p_recipient" className="text-xs font-semibold text-slate-700">
                Pilih Penerima Pesan <span className="text-rose-500">*</span>
              </Label>

              <div className="mt-1.5 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Ketik untuk memfilter nama/email pengguna..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl"
                  />
                </div>

                <select
                  id="p_recipient"
                  value={personalRecipientId}
                  onChange={(e) => setPersonalRecipientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#1769E0] focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Pengguna ({filteredUsers.length} tersedia) --</option>
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      [{u.role === 'pelamar' ? 'Pelamar' : 'Perusahaan'}] {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="p_subject" className="text-xs font-semibold text-slate-700">
                Subjek / Perihal (Opsional)
              </Label>
              <Input
                id="p_subject"
                type="text"
                value={personalSubject}
                onChange={(e) => setPersonalSubject(e.target.value)}
                placeholder="Contoh: Verifikasi Kelengkapan Profil & Berkas"
                className="mt-1.5 h-10 rounded-xl text-xs"
              />
            </div>

            {/* Message Body */}
            <div>
              <Label htmlFor="p_body" className="text-xs font-semibold text-slate-700">
                Isi Pesan <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="p_body"
                rows={4}
                value={personalBody}
                onChange={(e) => setPersonalBody(e.target.value)}
                placeholder="Tuliskan pesan Anda secara jelas dan profesional..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] outline-none resize-none"
                required
              />
            </div>

            <DialogFooter className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPersonalModal(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!personalRecipientId || !personalBody.trim() || isSendingPersonal}
                className="bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {isSendingPersonal ? 'Mengirim...' : 'Kirim Pesan Personal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: SIARKAN PENGUMUMAN */}
      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#102B4B]">
              Siarkan Pengumuman Langsung
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kirimkan pengumuman resmi ke seluruh pelamar, perusahaan, atau seluruh pengguna platform AKSARA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 py-2 text-xs">
            {/* Target Audience */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">
                Target Penerima Pengumuman <span className="text-rose-500">*</span>
              </Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'all',
                    label: 'Semua Pengguna',
                    desc: `${counts.total_users} Akun`,
                    icon: Users,
                  },
                  {
                    id: 'pelamar',
                    label: 'Semua Pelamar',
                    desc: `${counts.pelamar_count} Pelamar`,
                    icon: UserPlus,
                  },
                  {
                    id: 'perusahaan',
                    label: 'Semua Perusahaan',
                    desc: `${counts.perusahaan_count} Perusahaan`,
                    icon: Building2,
                  },
                ].map((tgt) => {
                  const Icon = tgt.icon;
                  const isChecked = announcementTarget === tgt.id;

                  return (
                    <button
                      key={tgt.id}
                      type="button"
                      onClick={() => setAnnouncementTarget(tgt.id as any)}
                      className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                        isChecked
                          ? 'border-[#1769E0] bg-blue-50/60 font-bold text-[#1769E0] shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1 text-[#1769E0]" />
                      <span className="text-[11px] leading-tight">{tgt.label}</span>
                      <span className="mt-0.5 text-[9px] text-slate-400">{tgt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Tingkat Urgensi</Label>
              <div className="mt-1.5 flex gap-2">
                {[
                  { id: 'normal', label: 'Informasi Biasa' },
                  { id: 'important', label: 'Penting' },
                  { id: 'urgent', label: 'Resmi / Mendesak' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAnnouncementPriority(p.id as any)}
                    className={`flex-1 rounded-xl border py-1.5 text-[11px] font-bold transition ${
                      announcementPriority === p.id
                        ? 'border-[#1769E0] bg-[#1769E0] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="anc_title" className="text-xs font-semibold text-slate-700">
                Judul Pengumuman <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="anc_title"
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Contoh: Pembaruan Kebijakan & Fitur Karir Inklusif AKSARA"
                className="mt-1.5 h-10 rounded-xl text-xs"
                required
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="anc_content" className="text-xs font-semibold text-slate-700">
                Isi Pengumuman <span className="text-rose-500">*</span>
              </Label>
              <textarea
                id="anc_content"
                rows={4}
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Tuliskan isi pengumuman yang akan disiarkan ke pengguna..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-1 focus:ring-[#1769E0] outline-none resize-none"
                required
              />
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-[11px] text-slate-600 flex items-start gap-2">
              <Bell className="h-4 w-4 text-[#1769E0] shrink-0 mt-0.5" />
              <span>
                Pengumuman ini otomatis dikirimkan ke <strong>lonceng notifikasi</strong> dan <strong>pesan masuk</strong> setiap akun penerima yang ditargetkan.
              </span>
            </div>

            <DialogFooter className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAnnouncementModal(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!announcementTitle.trim() || !announcementContent.trim() || isSendingAnnouncement}
                className="bg-[#1769E0] text-xs font-bold text-white hover:bg-[#1254B5]"
              >
                <Megaphone className="mr-1.5 h-3.5 w-3.5" />
                {isSendingAnnouncement ? 'Menyiarkan...' : 'Siarkan Pengumuman Sekarang'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
