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

        return Inertia::render('applications/messages', [
            'application' => $application->load(['vacancy.companyProfile', 'jobSeekerProfile.user']),
            'messages' => $messages,
        ]);
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
