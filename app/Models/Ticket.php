<?php

namespace App\Models;

use Carbon\Carbon; // <-- Tambahkan import ini
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'user_id',
        'assigned_to',
        'title',
        'description',
        'status',
        'priority',
        'sla_deadline',
    ];

    protected $casts = [
        'sla_deadline' => 'datetime',
    ];

    protected $appends = ['sla_status'];

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->sla_deadline)) {
                $ticket->sla_deadline = self::calculateSlaDeadline($ticket->priority);
            }
        });
    }

    public static function calculateSlaDeadline(string $priority): Carbon
    {
        return match ($priority) {
            'high' => now()->addHours(4),
            'normal' => now()->addHours(24),
            'low' => now()->addDays(3),
            default => now()->addHours(24),
        };
    }

    // --- SAMPAI SINI ---

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id'); // Pembuat tiket
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to'); // Agent yang menangani
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    /**
     * Menghitung status SLA secara on-the-fly.
     * Akan otomatis muncul sebagai properti 'sla_status' di JSON/Inertia response.
     */
    public function getSlaStatusAttribute(): string
    {
        if (in_array($this->status, ['resolved', 'closed'])) {
            return 'resolved';
        }

        if (now()->greaterThan($this->sla_deadline)) {
            return 'overdue';
        }

        // Definisi "due soon": jika tenggat waktu kurang dari 2 jam dari sekarang
        if (now()->diffInHours($this->sla_deadline, false) <= 2) {
            return 'due_soon';
        }

        return 'on_track';
    }
}