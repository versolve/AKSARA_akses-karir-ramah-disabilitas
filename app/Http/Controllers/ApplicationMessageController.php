<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationMessageController extends Controller
{
    private function authorizeParty(Request $request, Application $application): void
    {
        $user = $request->user();

        $isApplicant = $application->jobSeekerProfile && $application->jobSeekerProfile->user_id === $user->id;
        $isCompany = $application->vacancy && $application->vacancy->companyProfile && $application->vacancy->companyProfile->user_id === $user->id;
        $isAdmin = $user->isAdmin();

        abort_unless($isApplicant || $isCompany || $isAdmin, 403, 'Anda tidak berhak mengakses percakapan ini.');
    }

    public function inbox(Request $request): Response
    {
        $user = $request->user();

        if ($user->isPelamar()) {
            $seeker = $user->jobSeekerProfile;
            $applicationsQuery = Application::where('job_seeker_profile_id', $seeker?->id ?? 0)
                ->with(['vacancy.companyProfile'])
                ->withCount(['messages as unread_messages_count' => function ($q) use ($user) {
                    $q->where('sender_id', '!=', $user->id)->where('is_read', false);
                }]);
        } elseif ($user->isPerusahaan()) {
            $company = $user->companyProfile;
            $applicationsQuery = Application::whereHas('vacancy', fn ($q) => $q->where('company_profile_id', $company?->id ?? 0))
                ->with(['jobSeekerProfile.user', 'vacancy'])
                ->withCount(['messages as unread_messages_count' => function ($q) use ($user) {
                    $q->where('sender_id', '!=', $user->id)->where('is_read', false);
                }]);
        } else {
            $applicationsQuery = Application::with(['jobSeekerProfile.user', 'vacancy.companyProfile']);
        }

        $conversations = $applicationsQuery->latest('updated_at')->get();

        $selectedAppId = $request->input('application_id');
        $activeApplication = null;
        if ($selectedAppId) {
            $activeApplication = $conversations->firstWhere('id', (int) $selectedAppId);
        }
        if (!$activeApplication && $conversations->isNotEmpty()) {
            $activeApplication = $conversations->first();
        }

        $messages = [];
        if ($activeApplication) {
            $messages = $activeApplication->messages()->with('sender:id,name,role')->oldest()->get();

            // Mark as read for this user
            $activeApplication->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }

        return Inertia::render('applications/messages', [
            'conversations' => $conversations,
            'activeApplication' => $activeApplication ? $activeApplication->load(['vacancy.companyProfile', 'jobSeekerProfile.user']) : null,
            'messages' => $messages,
        ]);
    }

    public function index(Request $request, Application $application)
    {
        $this->authorizeParty($request, $application);

        $messages = $application->messages()
            ->with('sender:id,name,role')
            ->oldest()
            ->get();

        // Mark messages as read for receiver
        $application->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        if ($request->wantsJson()) {
            return response()->json($messages);
        }

        return redirect()->route('messages.inbox', ['application_id' => $application->id]);
    }

    public function store(Request $request, Application $application): RedirectResponse
    {
        $this->authorizeParty($request, $application);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $application->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_read' => false,
        ]);

        return back()->with('status', 'Pesan berhasil dikirim.');
    }
}
