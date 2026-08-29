<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Reply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ClientTicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = Ticket::where('organization_id', $request->user()->organization_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Client/Tickets/Index', [
            'tickets' => $tickets
        ]);
    }

    public function create()
    {
        return Inertia::render('Client/Tickets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,normal,high',
        ]);

        // Simpan tiket baru. 
        // Ingat, 'sla_deadline' akan diisi otomatis oleh Model Event yang kita buat di Fase 2!
        Ticket::create([
            'organization_id' => $request->user()->organization_id,
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'],
            'status' => 'open', // Status awal pasti 'open'
        ]);

        return redirect()->route('client.tickets.index');
    }

    public function show(Ticket $ticket)
    {
        // Otorisasi: Pastikan client hanya buka tiket perusahaannya (menggunakan Policy)
        Gate::authorize('view', $ticket);

        // Load relasi, HANYA AMBIL BALASAN PUBLIK
        $ticket->load([
            'replies' => function ($query) {
                $query->where('is_internal', false)->with('user');
            },
            'user', // Pembuat tiket
            'assignee' // Agent yang menangani
        ]);

        return Inertia::render('Client/Tickets/Show', [
            'ticket' => $ticket
        ]);
    }

    public function storeReply(Request $request, Ticket $ticket)
    {
        // 1. Otorisasi: Pastikan client hanya bisa membalas tiket perusahaannya sendiri
        Gate::authorize('view', $ticket);

        // 2. Validasi
        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        // 3. Simpan balasan ke database
        $ticket->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => false, // Client DIPASTIKAN tidak bisa membuat internal note
        ]);

        // (Opsional) Jika tiket sedang 'resolved', ubah kembali menjadi 'open' 
        // karena klien merespons ulang (menandakan masalah belum selesai).
        if ($ticket->status === 'resolved' || $ticket->status === 'closed') {
            $ticket->update(['status' => 'open']);
        }

        // 4. Redirect kembali ke halaman detail. 
        // Inertia akan otomatis mengambil ulang data tiket terbaru.
        return redirect()->back();
    }
}