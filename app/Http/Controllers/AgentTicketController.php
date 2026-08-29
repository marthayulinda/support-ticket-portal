<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Organization;
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
        // Load relasi: Agent BISA MELIHAT SEMUA BALASAN (termasuk is_internal = true)
        $ticket->load(['replies.user', 'user', 'organization', 'assignee']);

        return Inertia::render('Agent/Tickets/Show', [
            'ticket' => $ticket
        ]);
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

    /**
     * Agen menugaskan tiket kepada dirinya sendiri
     */
    public function assignToMe(Request $request, Ticket $ticket)
    {
        Gate::authorize('update', $ticket);

        // Jika status tiket masih 'open', otomatis ubah ke 'in_progress'
        $newStatus = $ticket->status === 'open' ? 'in_progress' : $ticket->status;

        $ticket->update([
            'assigned_to' => $request->user()->id,
            'status' => $newStatus,
        ]);

        return redirect()->back();
    }
}