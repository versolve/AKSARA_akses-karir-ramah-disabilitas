import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Building2,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Mail,
  Megaphone,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  User,
  Users,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactElement } from 'react';

interface Sender {
  id: number;
  name: string;
  role: string;
}

interface MessageItem {
  id: number;
  sender_id: number;
  body: string;
  created_at: string;
  sender: Sender;
}

interface ApplicationSummary {
  id: number;
  unread_messages_count?: number;
  updated_at: string;
  vacancy: {
    id: number;
    title: string;
    company_profile: {
      company_name: string;
    };
  };
  job_seeker_profile?: {
    user: {
      id: number;
      name: string;
    };
  };
}

interface AdminAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_label: string;
  sender_name: string;
  created_at: string;
  time_ago: string;
}

interface AdminDirectMessage {
  id: string;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  recipient_id: number;
  subject?: string;
  body: string;
  is_read: boolean;
  created_at: string;
  time_ago: string;
}

interface Props {
  conversations: ApplicationSummary[];
  activeApplication: ApplicationSummary | null;
  messages: MessageItem[];
  adminAnnouncements?: AdminAnnouncement[];
  adminDirectMessages?: AdminDirectMessage[];
}

export default function ApplicationMessages({
  conversations = [],
  activeApplication,
  messages = [],
  adminAnnouncements = [],
  adminDirectMessages = [],
}: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as any).auth;
  const currentUserId = auth?.user?.id;
  const isPelamar = auth?.user?.role === 'pelamar';

  const [isAdminSelected, setIsAdminSelected] = useState<boolean>(
    !activeApplication && (adminAnnouncements.length > 0 || adminDirectMessages.length > 0)
  );

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'important'>('all');
  const [inputBody, setInputBody] = useState('');
  const [adminReplyBody, setAdminReplyBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, adminDirectMessages]);

  const handleSendMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (!inputBody.trim() || !activeApplication || isSending) return;

    setIsSending(true);
    router.post(
      `/applications/${activeApplication.id}/messages`,
      { body: inputBody },
      {
        preserveScroll: true,
        onSuccess: () => {
          setInputBody('');
          setIsSending(false);
        },
        onError: () => {
          setIsSending(false);
        },
      }
    );
  };

  const handleSendAdminReply = (e: FormEvent): void => {
    e.preventDefault();
    if (!adminReplyBody.trim() || isSendingAdminReply) return;

    setIsSendingAdminReply(true);
    router.post(
      '/messages/reply-admin',
      { body: adminReplyBody },
      {
        preserveScroll: true,
        onSuccess: () => {
          setAdminReplyBody('');
          setIsSendingAdminReply(false);
        },
        onError: () => {
          setIsSendingAdminReply(false);
        },
      }
    );
  };

  const handleSelectConversation = (appId: number): void => {
    setIsAdminSelected(false);
    router.get(
      '/messages',
      { application_id: appId },
      { preserveState: true, preserveScroll: true }
    );
  };

  const filteredConversations = conversations.filter((c) => {
    const company = c.vacancy?.company_profile?.company_name || '';
    const title = c.vacancy?.title || '';
    const seeker = c.job_seeker_profile?.user?.name || '';
    const matchesSearch =
      company.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      seeker.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'unread') return (c.unread_messages_count ?? 0) > 0;
    return true;
  });

  const activeTitle = isPelamar
    ? activeApplication?.vacancy?.company_profile?.company_name || 'Perusahaan'
    : activeApplication?.job_seeker_profile?.user?.name || 'Pelamar';

  const activeSubtitle = activeApplication?.vacancy?.title || 'Posisi Lowongan';
  const activeInitials = activeTitle.substring(0, 2).toUpperCase();

  const unreadAdminCount = adminDirectMessages.filter(
    (m) => m.recipient_id === currentUserId && !m.is_read
  ).length;

  return (
    <AppLayout>
      <Head title="Pesan - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
            Pesan & Pengumuman
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Berkomunikasi dengan HR perusahaan, melihat pesan personal, dan memantau pengumuman resmi platform AKSARA.
          </p>
        </div>

        {/* Split Chat Box Container */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex flex-col md:flex-row h-[640px]">
          {/* ===================== LEFT PANE: CONVERSATION LIST (340PX) ===================== */}
          <div className="w-full md:w-[350px] border-r border-[#E2E8F0] flex flex-col shrink-0 bg-white">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#F1F5F9]">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pesan atau nama..."
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-10 pr-3.5 py-2 text-xs text-[#102B4B] placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/20 outline-none transition min-h-[40px]"
                />
              </div>

              {/* Filter Tabs Row */}
              <div className="flex items-center gap-1.5 mt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer select-none ${
                    filterTab === 'all'
                      ? 'bg-[#EBF5FA] text-[#123B5D]'
                      : 'text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  Semua
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab('unread')}
                  className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer select-none flex items-center gap-1.5 ${
                    filterTab === 'unread'
                      ? 'bg-[#EBF5FA] text-[#123B5D]'
                      : 'text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  <span>Belum Dibaca</span>
                  {unreadAdminCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E64B55] text-white text-[9px] font-black">
                      {unreadAdminCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab('important')}
                  className={`rounded-xl px-3 py-1.5 font-bold transition cursor-pointer select-none ${
                    filterTab === 'important'
                      ? 'bg-[#EBF5FA] text-[#123B5D]'
                      : 'text-[#64748B] hover:bg-slate-50'
                  }`}
                >
                  Pengumuman
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
              {/* PINNED ITEM: Administrator AKSARA (Official) */}
              <div
                onClick={() => setIsAdminSelected(true)}
                className={`flex items-start justify-between gap-3 p-3.5 transition cursor-pointer border-l-4 ${
                  isAdminSelected
                    ? 'bg-[#EBF5FA] border-l-[#1769E0]'
                    : 'border-l-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-[#1769E0] shrink-0 shadow-xs">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-xs text-[#102B4B] truncate">
                        Administrator AKSARA
                      </h3>
                      <span className="rounded bg-blue-100 text-[#1769E0] text-[9px] px-1 font-bold">
                        Resmi
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                      {adminDirectMessages.length > 0
                        ? adminDirectMessages[adminDirectMessages.length - 1].body
                        : adminAnnouncements.length > 0
                        ? adminAnnouncements[0].title
                        : 'Pusat pengumuman dan pesan admin'}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pengumuman & Pesan Resmi
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-medium text-[#94A3B8]">Admin</span>
                  {unreadAdminCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E64B55] text-white text-[9px] font-black">
                      {unreadAdminCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Application Conversations */}
              {filteredConversations.length === 0 && !isAdminSelected ? (
                <div className="py-12 text-center text-xs text-slate-400 px-4">
                  Belum ada percakapan lamaran pekerjaan.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = !isAdminSelected && activeApplication?.id === conv.id;
                  const title = isPelamar
                    ? conv.vacancy.company_profile.company_name
                    : conv.job_seeker_profile?.user.name || 'Pelamar';
                  const subtitle = conv.vacancy.title;
                  const initials = title.substring(0, 2).toUpperCase();
                  const unread = conv.unread_messages_count ?? 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`flex items-start justify-between gap-3 p-3.5 transition cursor-pointer ${
                        isSelected ? 'bg-[#EBF5FA]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-xs text-[#102B4B] truncate">
                            {title}
                          </h3>
                          <p className="text-[11px] font-semibold text-[#64748B] truncate mt-0.5">
                            {subtitle}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            Klik untuk membuka percakapan...
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-[#94A3B8]">Lamaran</span>
                        {unread > 0 && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E64B55] text-white text-[9px] font-black">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===================== RIGHT PANE: ACTIVE CONVERSATION ===================== */}
          <div className="flex-1 flex flex-col bg-white">
            {isAdminSelected ? (
              /* ================== ADMIN / ANNOUNCEMENTS THREAD ================== */
              <>
                <div className="flex items-center justify-between p-4 border-b border-[#F1F5F9] shrink-0 bg-white">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-[#1769E0] shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-sm sm:text-base text-[#102B4B]">
                          Administrator AKSARA
                        </h2>
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#1769E0]">
                          Pemberitahuan & Dukungan Resmi
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B]">
                        Saluran komunikasi resmi dan siaran pengumuman platform AKSARA
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages & Announcements List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F8FBFE]/50">
                  {/* Official Announcements Section */}
                  {adminAnnouncements.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1769E0] uppercase tracking-wider">
                        <Megaphone className="h-4 w-4" />
                        <span>Pengumuman Siaran Resmi</span>
                      </div>

                      {adminAnnouncements.map((anc) => (
                        <div
                          key={anc.id}
                          className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#1769E0]">
                              {anc.target_label}
                            </span>
                            <span className="text-[10px] text-slate-400">{anc.time_ago}</span>
                          </div>
                          <h3 className="font-bold text-sm text-[#102B4B]">{anc.title}</h3>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {anc.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Direct Messages Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#102B4B] uppercase tracking-wider">
                      <Mail className="h-4 w-4 text-[#1769E0]" />
                      <span>Percakapan Personal dengan Admin</span>
                    </div>

                    {adminDirectMessages.length === 0 ? (
                      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-xs text-slate-400">
                        Belum ada pesan personal dari Administrator. Anda dapat mengetikkan pertanyaan atau tanggapan di bawah ini.
                      </div>
                    ) : (
                      adminDirectMessages.map((msg) => {
                        const isMine = msg.sender_id === currentUserId;

                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`flex items-center gap-2 mb-1 text-[11px] text-[#64748B] ${
                                isMine ? 'flex-row-reverse' : ''
                              }`}
                            >
                              <span className="font-bold text-[#102B4B]">
                                {isMine ? 'Saya' : 'Administrator AKSARA'}
                              </span>
                              <span>•</span>
                              <span>{msg.time_ago}</span>
                            </div>

                            <div
                              className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                                isMine
                                  ? 'bg-[#1769E0] text-white rounded-tr-none shadow-xs'
                                  : 'bg-white border border-[#E2E8F0] text-[#102B4B] rounded-tl-none shadow-xs'
                              }`}
                            >
                              {msg.subject && (
                                <p className="font-bold border-b pb-1 mb-1 text-xs opacity-90">
                                  Subjek: {msg.subject}
                                </p>
                              )}
                              <p className="whitespace-pre-wrap">{msg.body}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Reply Form to Admin */}
                <form
                  onSubmit={handleSendAdminReply}
                  className="p-3.5 border-t border-[#F1F5F9] flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={adminReplyBody}
                    onChange={(e) => setAdminReplyBody(e.target.value)}
                    placeholder="Balas pesan ke Administrator AKSARA..."
                    className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs sm:text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/20 outline-none transition min-h-[44px]"
                    disabled={isSendingAdminReply}
                  />

                  <button
                    type="submit"
                    disabled={isSendingAdminReply || !adminReplyBody.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1769E0] hover:bg-[#1254B5] text-white shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    aria-label="Kirim balasan ke admin"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : activeApplication ? (
              /* ================== JOB APPLICATION CONVERSATION THREAD ================== */
              <>
                {/* Top Conversation Header */}
                <div className="flex items-center gap-3.5 p-4 border-b border-[#F1F5F9] shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-sm shrink-0">
                    {activeInitials}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-[#102B4B]">
                      {activeTitle}
                    </h2>
                    <p className="text-xs text-[#64748B]">{activeSubtitle}</p>
                  </div>
                </div>

                {/* Messages Thread Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                      Belum ada pesan dalam percakapan ini. Mulai kirimkan pesan di bawah.
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.sender_id === currentUserId;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                        >
                          {/* Sender Meta */}
                          <div
                            className={`flex items-center gap-2 mb-1 text-[11px] text-[#64748B] ${
                              isMine ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <span className="font-bold text-[#102B4B]">{msg.sender.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(msg.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                              isMine
                                ? 'bg-[#EBF5FA] text-[#102B4B] rounded-tr-none'
                                : 'bg-[#F8FAFC] border border-[#F1F5F9] text-[#102B4B] rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-[#F1F5F9] flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    placeholder="Tulis pesan ke perusahaan..."
                    className="flex-1 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs sm:text-sm text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[44px]"
                    disabled={isSending}
                  />

                  <button
                    type="submit"
                    disabled={isSending || !inputBody.trim()}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#123B5D] hover:bg-[#0C2742] text-white shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
                    aria-label="Kirim pesan"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-xs text-slate-400">
                Pilih salah satu percakapan di sebelah kiri untuk melihat pesan.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

