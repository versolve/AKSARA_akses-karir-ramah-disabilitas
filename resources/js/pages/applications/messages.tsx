import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Paperclip,
  Search,
  Send,
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

interface Props {
  conversations: ApplicationSummary[];
  activeApplication: ApplicationSummary | null;
  messages: MessageItem[];
}

export default function ApplicationMessages({
  conversations = [],
  activeApplication,
  messages = [],
}: Props): ReactElement {
  const page = usePage();
  const auth = (page.props as any).auth;
  const currentUserId = auth?.user?.id;
  const isPelamar = auth?.user?.role === 'pelamar';

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'important'>('all');
  const [inputBody, setInputBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSelectConversation = (appId: number): void => {
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

  return (
    <AppLayout>
      <Head title="Pesan - AKSARA" />

      <div className="py-6 sm:py-8 space-y-6">
        {/* Title Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4B] tracking-tight">
            Pesan
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#64748B]">
            Berkomunikasi dengan HR terkait proses lamaran dan informasi penting lainnya.
          </p>
        </div>

        {/* Split Chat Box Container matching Pesan.png */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden flex flex-col md:flex-row h-[620px]">
          {/* ===================== LEFT PANE: CONVERSATION LIST (4 COLS / 340PX) ===================== */}
          <div className="w-full md:w-[340px] border-r border-[#E2E8F0] flex flex-col shrink-0 bg-white">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-[#F1F5F9]">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pesan atau nama perusahaan..."
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white pl-10 pr-3.5 py-2 text-xs text-[#102B4B] placeholder:text-slate-400 focus:border-[#007F96] focus:ring-2 focus:ring-[#007F96]/20 outline-none transition min-h-[40px]"
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
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E64B55] text-white text-[9px] font-black">
                    2
                  </span>
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
                  Penting
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
              {filteredConversations.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 px-4">
                  Belum ada percakapan pesan.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeApplication?.id === conv.id;
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
                        isSelected
                          ? 'bg-[#EBF5FA]'
                          : 'hover:bg-slate-50'
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
                        <span className="text-[10px] font-medium text-[#94A3B8]">15:00</span>
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

          {/* ===================== RIGHT PANE: ACTIVE CONVERSATION (8 COLS) ===================== */}
          <div className="flex-1 flex flex-col bg-white">
            {activeApplication ? (
              <>
                {/* Top Conversation Header matching Pesan.png */}
                <div className="flex items-center gap-3.5 p-4 border-b border-[#F1F5F9] shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A36B] font-extrabold text-sm shrink-0">
                    {activeInitials}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-[#102B4B]">
                      {activeTitle}
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      {activeSubtitle}
                    </p>
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
                          <div className={`flex items-center gap-2 mb-1 text-[11px] text-[#64748B] ${isMine ? 'flex-row-reverse' : ''}`}>
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

                {/* Bottom Input Form matching Pesan.png */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3.5 border-t border-[#F1F5F9] flex items-center gap-2 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => alert('Fitur unggah berkas lampiran pendukung')}
                    className="p-2 text-slate-400 hover:text-[#123B5D] transition rounded-lg cursor-pointer"
                    aria-label="Lampirkan dokumen"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <input
                    type="text"
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    placeholder="Tulis pesan....."
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
