<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AgentTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with('organization');

        // Filter Status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter Priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter Organization
        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $tickets = $query->orderBy('sla_deadline', 'asc')->get();
        $organizations = Organization::orderBy('name')->get(); // Ambil list perusahaan

        return Inertia::render('Agent/Tickets/Index', [
            'tickets' => $tickets,
            'organizations' => $organizations,
            // Kirim kembali nilai filter yang sedang aktif agar UI dropdown tidak reset
            'filters' => $request->only(['status', 'priority', 'organization_id']) 
        ]);
    }

    public function show(Ticket $ticket)
    {
        Gate::authorize('view', $ticket);

        $ticket->load(['user', 'organization', 'assignee', 'replies.user']);
        
        // Mengambil semua user yang memiliki role 'agent'
        $agents = User::where('role', 'agent')->orderBy('name')->get();

        return Inertia::render('Agent/Tickets/Show', [
            'ticket' => $ticket,
            'agents' => $agents,
        ]);
    }

    public function assign(Request $request, Ticket $ticket)
    {
        Gate::authorize('update', $ticket);

        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        // Pastikan user yang dipilih benar-benar seorang agent
        $agent = User::where('role', 'agent')->findOrFail($validated['assigned_to']);

        $newStatus = $ticket->status === 'open' ? 'in_progress' : $ticket->status;

        $ticket->update([
            'assigned_to' => $agent->id,
            'status' => $newStatus,
        ]);

        return redirect()->back();
    }

    /**
     * Menyimpan balasan (baik Publik maupun Internal Note)
     */
    public function storeReply(Request $request, Ticket $ticket)
    {
        // Otorisasi melalui Policy: Pastikan yang membalas adalah Agent
        Gate::authorize('update', $ticket);

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
            'is_internal' => 'required|boolean',
        ]);

        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => $validated['is_internal'],
        ]);

        return redirect()->back();
    }

    /**
     * Memperbarui Status dan Prioritas tiket
     */
    public function updateTicket(Request $request, Ticket $ticket)
    {
        Gate::authorize('update', $ticket);

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'priority' => 'required|in:low,normal,high',
        ]);

        // Jika prioritas diubah, SLA Deadline juga harus dikalkulasi ulang
        if ($ticket->priority !== $validated['priority']) {
            $ticket->sla_deadline = Ticket::calculateSlaDeadline($validated['priority']);
        }

        $ticket->update([
            'status' => $validated['status'],
            'priority' => $validated['priority'],
        ]);

        return redirect()->back();
    }
}