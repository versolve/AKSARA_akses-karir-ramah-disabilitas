import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { MessageSquare, Send, X } from 'lucide-react';
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

interface Props {
  applicationId: number;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationChatModal({
  applicationId,
  recipientName,
  isOpen,
  onClose,
}: Props): ReactElement | null {
  const page = usePage();
  const currentUserId = (page.props.auth as any)?.user?.id;

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/applications/${applicationId}/messages`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, applicationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    router.post(
      `/applications/${applicationId}/messages`,
      { body: newMessage },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewMessage('');
          setIsSending(false);
          fetchMessages();
        },
        onError: () => {
          setIsSending(false);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex h-[560px] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 id="chat-modal-title" className="text-sm font-bold text-slate-900">
                Pesan: {recipientName}
              </h3>
              <p className="text-[11px] text-slate-500">Percakapan proses lamaran kerja</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup percakapan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">
              Memuat percakapan...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-xs text-slate-400">
              <MessageSquare className="mb-2 h-8 w-8 text-slate-300" />
              <span>Belum ada pesan. Mulai sapa {recipientName}.</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                    {msg.sender.name} ({msg.sender.role.toUpperCase()})
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                  </div>
                  <span className="mt-0.5 text-[10px] text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold min-h-[44px] min-w-[44px] flex items-center justify-center px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
