<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Menentukan apakah user bisa melihat daftar tiket.
     * (Pembatasan query data spesifiknya nanti dilakukan di Controller)
     */
    public function viewAny(User $user): bool
    {
        return true; 
    }

    /**
     * Menentukan apakah user bisa membuka/melihat detail tiket tertentu.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        // Agent bisa melihat semua tiket
        if ($user->isAgent()) {
            return true;
        }

        // Client hanya bisa melihat tiket milik perusahaannya sendiri
        return $user->organization_id === $ticket->organization_id;
    }

    /**
     * Menentukan apakah user bisa membuat tiket baru.
     */
    public function create(User $user): bool
    {
        // Berdasarkan soal: hanya Client yang membuat tiket untuk perusahaannya
        return $user->isClient();
    }

    /**
     * Menentukan apakah user bisa mengubah data tiket (status, priority, assign).
     */
    public function update(User $user, Ticket $ticket): bool
    {
        // Berdasarkan soal: hanya Agent yang bisa mengubah status, priority, dll
        return $user->isAgent();
    }
}