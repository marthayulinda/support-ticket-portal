<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Reply;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Organisasi
        $orgAcme = Organization::create(['name' => 'Acme Corp']);
        $orgGlobex = Organization::create(['name' => 'Globex Inc']);

        // Password default untuk semua user
        $password = Hash::make('password');

        // 2. Buat Akun Agent (Internal)
        $agent1 = User::create([
            'name' => 'Support Agent Budi',
            'email' => 'agent@envolutions.test',
            'password' => $password,
            'role' => 'agent',
            'organization_id' => null, // Agent tidak terikat klien
        ]);

        // 3. Buat Akun Client
        $clientAcme = User::create([
            'name' => 'Client Acme',
            'email' => 'client@acme.test',
            'password' => $password,
            'role' => 'client',
            'organization_id' => $orgAcme->id,
        ]);

        $clientGlobex = User::create([
            'name' => 'Client Globex',
            'email' => 'client@globex.test',
            'password' => $password,
            'role' => 'client',
            'organization_id' => $orgGlobex->id,
        ]);

        // 4. Buat Tiket Skenario
        
        // Tiket 1: Overdue (SLA kelewat) - Milik Acme
        $ticket1 = Ticket::create([
            'organization_id' => $orgAcme->id,
            'user_id' => $clientAcme->id,
            'title' => 'Server Production Down!',
            'description' => 'Website kami tidak bisa diakses sama sekali sejak pagi.',
            'status' => 'open',
            'priority' => 'high',
            'sla_deadline' => Carbon::now()->subHours(2), // Lewat 2 jam lalu
        ]);

        // Tiket 2: Due Soon (Hampir telat) - Milik Acme, Dipegang Agent
        $ticket2 = Ticket::create([
            'organization_id' => $orgAcme->id,
            'user_id' => $clientAcme->id,
            'assigned_to' => $agent1->id,
            'title' => 'Gagal export report PDF',
            'description' => 'Tombol export selalu memunculkan error 500.',
            'status' => 'in_progress',
            'priority' => 'normal',
            'sla_deadline' => Carbon::now()->addHours(3), // Sisa 3 jam
        ]);

        // Tiket 3: On Track (Masih lama) - Milik Globex
        $ticket3 = Ticket::create([
            'organization_id' => $orgGlobex->id,
            'user_id' => $clientGlobex->id,
            'title' => 'Request ubah warna dashboard',
            'description' => 'Tolong ubah warna header menjadi biru tua.',
            'status' => 'open',
            'priority' => 'low',
            'sla_deadline' => Carbon::now()->addDays(3), // Sisa 3 hari
        ]);

        // 5. Buat Percakapan (Replies) di Tiket 2 untuk tes Visibilitas
        Reply::create([
            'ticket_id' => $ticket2->id,
            'user_id' => $clientAcme->id,
            'body' => 'Apakah ada update mengenai error ini?',
            'is_internal' => false,
        ]);

        Reply::create([
            'ticket_id' => $ticket2->id,
            'user_id' => $agent1->id,
            'body' => 'Sedang kami investigasi, tim teknis sedang mengecek log server.',
            'is_internal' => false, // Balasan publik (klien bisa lihat)
        ]);

        Reply::create([
            'ticket_id' => $ticket2->id,
            'user_id' => $agent1->id,
            'body' => 'Log menunjukkan memori limit habis. Tolong koordinasi dengan DevOps untuk naikkan RAM.',
            'is_internal' => true, // INTERNAL NOTE (klien tidak boleh lihat!)
        ]);
    }
}