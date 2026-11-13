<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    private static function getDirectMessagesFilePath(): string
    {
        return storage_path('app/admin_direct_messages.json');
    }

    private static function getAnnouncementsFilePath(): string
    {
        return storage_path('app/admin_announcements.json');
    }

    public static function loadDirectMessages(): array
    {
        $path = self::getDirectMessagesFilePath();
        if (!File::exists($path)) {
            // Seed a welcoming default conversation if file doesn't exist
            return [];
        }

        $content = File::get($path);
        return json_decode($content, true) ?: [];
    }

    public static function saveDirectMessages(array $messages): void
    {
        $path = self::getDirectMessagesFilePath();
        if (!File::isDirectory(dirname($path))) {
            File::makeDirectory(dirname($path), 0755, true, true);
        }
        File::put($path, json_encode($messages, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public static function loadAnnouncements(): array
    {
        $path = self::getAnnouncementsFilePath();
        if (!File::exists($path)) {
            // Default initial announcements
            $defaults = [
                [
                    'id' => 'anc_' . time() . '_init',
                    'title' => 'Selamat Datang di Platform Karir Inklusif AKSARA',
                    'content' => 'Selamat datang di AKSARA! Platform ini dirancang untuk menghubungkan talenta penyandang disabilitas dengan perusahaan-perusahaan inklusif terkemuka. Pastikan profil Anda telah lengkap dan terverifikasi untuk mendapatkan peluang kerja terbaik.',
                    'target' => 'all',
                    'target_label' => 'Semua Pengguna',
                    'priority' => 'important',
                    'sender_name' => 'Administrator AKSARA',
                    'created_at' => now()->subDays(2)->toIso8601String(),
                    'time_ago' => '2 hari yang lalu',
                    'recipient_count' => 12,
                ],
            ];
            self::saveAnnouncements($defaults);
            return $defaults;
        }

        $content = File::get($path);
        return json_decode($content, true) ?: [];
    }

    public static function saveAnnouncements(array $announcements): void
    {
        $path = self::getAnnouncementsFilePath();
        if (!File::isDirectory(dirname($path))) {
            File::makeDirectory(dirname($path), 0755, true, true);
        }
        File::put($path, json_encode($announcements, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    public function index(Request $request): Response
    {
        $admin = $request->user();

        // 1. Load users for autocomplete / dropdown
        $usersQuery = User::where('role', '!=', 'admin')
            ->select('id', 'name', 'email', 'role', 'avatar')
            ->orderBy('name');

        $users = $usersQuery->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'role_label' => $u->role === 'pelamar' ? 'Pelamar Disabilitas' : 'Perusahaan',
                'avatar' => $u->avatar,
            ];
        });

        // 2. Load Direct Messages
        $allDirectMessages = self::loadDirectMessages();

        // Group into conversations by user_id
        $conversationsByUser = [];
        foreach ($allDirectMessages as $msg) {
            $otherUserId = $msg['sender_id'] === $admin->id ? $msg['recipient_id'] : $msg['sender_id'];
            if (!isset($conversationsByUser[$otherUserId])) {
                $conversationsByUser[$otherUserId] = [];
            }
            $conversationsByUser[$otherUserId][] = $msg;
        }

        // Format conversation list
        $conversationList = [];
        foreach ($conversationsByUser as $otherUserId => $msgs) {
            $otherUser = $users->firstWhere('id', (int) $otherUserId);
            if (!$otherUser) {
                $dbUser = User::find($otherUserId);
                if ($dbUser) {
                    $otherUser = [
                        'id' => $dbUser->id,
                        'name' => $dbUser->name,
                        'email' => $dbUser->email,
                        'role' => $dbUser->role,
                        'role_label' => $dbUser->role === 'pelamar' ? 'Pelamar Disabilitas' : 'Perusahaan',
                        'avatar' => $dbUser->avatar,
                    ];
                }
            }

            if ($otherUser) {
                // Sort messages by created_at ascending
                usort($msgs, fn ($a, $b) => strcmp($a['created_at'], $b['created_at']));
                $lastMsg = end($msgs);
                $unreadCount = count(array_filter($msgs, fn ($m) => $m['recipient_id'] === $admin->id && empty($m['is_read'])));

                $conversationList[] = [
                    'id' => 'conv_' . $otherUserId,
                    'user' => $otherUser,
                    'last_message' => $lastMsg['body'] ?? '',
                    'last_message_at' => $lastMsg['created_at'] ?? now()->toIso8601String(),
                    'last_message_time_ago' => Carbon::parse($lastMsg['created_at'] ?? now())->diffForHumans(),
                    'unread_count' => $unreadCount,
                    'messages_count' => count($msgs),
                ];
            }
        }

        // Sort conversations by latest message descending
        usort($conversationList, fn ($a, $b) => strcmp($b['last_message_at'], $a['last_message_at']));

        // Active conversation determination
        $selectedUserId = $request->input('user_id');
        $selectedConvId = $request->input('conversation_id');

        if ($selectedConvId && str_starts_with($selectedConvId, 'conv_')) {
            $selectedUserId = (int) str_replace('conv_', '', $selectedConvId);
        }

        if (!$selectedUserId && !empty($conversationList)) {
            $selectedUserId = $conversationList[0]['user']['id'];
        }

        $activeConversation = null;
        $activeMessages = [];
        if ($selectedUserId) {
            $targetUser = $users->firstWhere('id', (int) $selectedUserId);
            if (!$targetUser) {
                $dbUser = User::find($selectedUserId);
                if ($dbUser) {
                    $targetUser = [
                        'id' => $dbUser->id,
                        'name' => $dbUser->name,
                        'email' => $dbUser->email,
                        'role' => $dbUser->role,
                        'role_label' => $dbUser->role === 'pelamar' ? 'Pelamar Disabilitas' : 'Perusahaan',
                        'avatar' => $dbUser->avatar,
                    ];
                }
            }

            if ($targetUser) {
                $activeConversation = [
                    'id' => 'conv_' . $selectedUserId,
                    'user' => $targetUser,
                ];

                $activeMessages = $conversationsByUser[$selectedUserId] ?? [];
                usort($activeMessages, fn ($a, $b) => strcmp($a['created_at'], $b['created_at']));

                // Mark unread messages sent to admin as read
                $updatedAny = false;
                foreach ($allDirectMessages as &$m) {
                    if ($m['sender_id'] == $selectedUserId && $m['recipient_id'] == $admin->id && empty($m['is_read'])) {
                        $m['is_read'] = true;
                        $updatedAny = true;
                    }
                }
                unset($m);
                if ($updatedAny) {
                    self::saveDirectMessages($allDirectMessages);
                }
            }
        }

        // 3. Load Announcements
        $announcements = self::loadAnnouncements();
        usort($announcements, fn ($a, $b) => strcmp($b['created_at'], $a['created_at']));

        // Counts
        $totalRecipientsReached = 0;
        foreach ($announcements as $anc) {
            $totalRecipientsReached += ($anc['recipient_count'] ?? 0);
        }

        $totalUnreadMessages = 0;
        foreach ($conversationList as $c) {
            $totalUnreadMessages += $c['unread_count'];
        }

        $counts = [
            'total_conversations' => count($conversationList),
            'unread_messages' => $totalUnreadMessages,
            'total_announcements' => count($announcements),
            'total_recipients' => $totalRecipientsReached,
            'total_users' => $users->count(),
            'pelamar_count' => $users->where('role', 'pelamar')->count(),
            'perusahaan_count' => $users->where('role', 'perusahaan')->count(),
        ];

        return Inertia::render('admin/messages/index', [
            'conversations' => $conversationList,
            'activeConversation' => $activeConversation,
            'messages' => $activeMessages,
            'announcements' => $announcements,
            'users' => $users->values(),
            'counts' => $counts,
        ]);
    }

    public function storeDirectMessage(Request $request): RedirectResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'recipient_id' => ['required', 'exists:users,id'],
            'body' => ['required', 'string', 'max:5000'],
            'subject' => ['nullable', 'string', 'max:255'],
        ]);

        $recipient = User::findOrFail($validated['recipient_id']);

        $allDirectMessages = self::loadDirectMessages();

        $newMessage = [
            'id' => 'dm_' . time() . '_' . Str::random(6),
            'sender_id' => $admin->id,
            'sender_name' => $admin->name,
            'sender_role' => 'admin',
            'recipient_id' => $recipient->id,
            'recipient_name' => $recipient->name,
            'subject' => $validated['subject'] ?? null,
            'body' => $validated['body'],
            'is_read' => false,
            'created_at' => now()->toIso8601String(),
            'time_ago' => 'Baru saja',
        ];

        $allDirectMessages[] = $newMessage;
        self::saveDirectMessages($allDirectMessages);

        // Also push a database notification to recipient if possible
        try {
            \Illuminate\Support\Facades\DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\AdminDirectMessage',
                'notifiable_type' => User::class,
                'notifiable_id' => $recipient->id,
                'data' => json_encode([
                    'title' => 'Pesan Baru dari Administrator AKSARA',
                    'message' => Str::limit($validated['body'], 100),
                    'sender_name' => 'Administrator AKSARA',
                    'category' => 'system',
                    'link' => '/messages',
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Ignore database notification error if table unwriteable
        }

        return redirect()->route('admin.messages.index', ['user_id' => $recipient->id])
            ->with('status', "Pesan personal berhasil dikirim ke {$recipient->name}.");
    }

    public function storeAnnouncement(Request $request): RedirectResponse
    {
        $admin = $request->user();

        $validated = $request->validate([
            'target' => ['required', 'in:all,pelamar,perusahaan'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'priority' => ['required', 'in:normal,important,urgent'],
        ]);

        $targetLabels = [
            'all' => 'Semua Pengguna (Pelamar & Perusahaan)',
            'pelamar' => 'Semua Pelamar Disabilitas',
            'perusahaan' => 'Semua Perusahaan Terdaftar',
        ];

        // Determine recipient users count
        $recipientQuery = User::where('role', '!=', 'admin');
        if ($validated['target'] === 'pelamar') {
            $recipientQuery->where('role', 'pelamar');
        } elseif ($validated['target'] === 'perusahaan') {
            $recipientQuery->where('role', 'perusahaan');
        }
        $recipients = $recipientQuery->get();
        $recipientCount = $recipients->count();

        $announcements = self::loadAnnouncements();

        $newAnnouncement = [
            'id' => 'anc_' . time() . '_' . Str::random(6),
            'admin_id' => $admin->id,
            'sender_name' => 'Administrator AKSARA',
            'target' => $validated['target'],
            'target_label' => $targetLabels[$validated['target']],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'priority' => $validated['priority'],
            'recipient_count' => $recipientCount,
            'created_at' => now()->toIso8601String(),
            'time_ago' => 'Baru saja',
        ];

        $announcements[] = $newAnnouncement;
        self::saveAnnouncements($announcements);

        // Send notifications to all targeted users
        try {
            $now = now();
            $batchNotifications = [];
            foreach ($recipients as $recipient) {
                $batchNotifications[] = [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\Notifications\AdminAnnouncement',
                    'notifiable_type' => User::class,
                    'notifiable_id' => $recipient->id,
                    'data' => json_encode([
                        'title' => 'Pengumuman: ' . $validated['title'],
                        'message' => Str::limit($validated['content'], 120),
                        'sender_name' => 'Administrator AKSARA',
                        'priority' => $validated['priority'],
                        'category' => 'system',
                        'link' => '/messages',
                    ]),
                    'read_at' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if (!empty($batchNotifications)) {
                // Insert in chunks of 50
                foreach (array_chunk($batchNotifications, 50) as $chunk) {
                    \Illuminate\Support\Facades\DB::table('notifications')->insert($chunk);
                }
            }
        } catch (\Throwable $e) {
            // Ignore if notifications table unavailable
        }

        return back()->with('status', "Pengumuman berhasil disiarkan ke {$targetLabels[$validated['target']]} ({$recipientCount} penerima).");
    }

    public function destroyAnnouncement(Request $request, string $id): RedirectResponse
    {
        $announcements = self::loadAnnouncements();
        $filtered = array_values(array_filter($announcements, fn ($a) => $a['id'] !== $id));
        self::saveAnnouncements($filtered);

        return back()->with('status', 'Pengumuman berhasil dihapus.');
    }
}
