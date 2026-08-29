<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\Reply;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketFeatureTest extends TestCase
{
    // Me-reset database testing setiap kali tes dijalankan agar data tidak bentrok
    use RefreshDatabase; 

    public function test_sla_deadline_is_calculated_correctly_on_creation()
    {
        $organization = Organization::create(['name' => 'Acme Corp']);
        $client = User::create([
            'name' => 'Client',
            'email' => 'client@acme.test',
            'password' => bcrypt('password'),
            'role' => 'client',
            'organization_id' => $organization->id,
        ]);

        // Buat tiket High priority (SLA 4 Jam)
        $ticket = Ticket::create([
            'organization_id' => $organization->id,
            'user_id' => $client->id,
            'title' => 'High Priority Issue',
            'description' => 'System is down',
            'priority' => 'high',
            'status' => 'open',
        ]);

        // Pastikan SLA deadline terisi dan bernilai sekitar 4 jam dari waktu pembuatan
        $this->assertNotNull($ticket->sla_deadline);
        $this->assertEquals(
            now()->addHours(4)->format('Y-m-d H'), 
            $ticket->sla_deadline->format('Y-m-d H')
        );
    }

    public function test_client_cannot_see_internal_notes_in_response()
    {
        $organization = Organization::create(['name' => 'Acme Corp']);
        
        $client = User::create([
            'name' => 'Client',
            'email' => 'client@acme.test',
            'password' => bcrypt('password'),
            'role' => 'client',
            'organization_id' => $organization->id,
        ]);

        $agent = User::create([
            'name' => 'Agent',
            'email' => 'agent@envolutions.test',
            'password' => bcrypt('password'),
            'role' => 'agent',
        ]);

        $ticket = Ticket::create([
            'organization_id' => $organization->id,
            'user_id' => $client->id,
            'title' => 'Test Ticket',
            'description' => 'Issue description',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        // Agen membuat 1 balasan publik
        Reply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'This is a PUBLIC reply.',
            'is_internal' => false,
        ]);

        // Agen membuat 1 balasan internal
        Reply::create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'This is a SECRET INTERNAL note.',
            'is_internal' => true,
        ]);

        // Client mencoba membuka halaman detail tiket
        $response = $this->actingAs($client)->get(route('client.tickets.show', $ticket->id));

        // Pastikan halaman bisa diakses
        $response->assertStatus(200);

        // Pastikan teks balasan publik bisa dilihat oleh client
        $response->assertSee('This is a PUBLIC reply.');

        // Kritis: Pastikan teks internal note sama sekali tidak dikirim ke frontend client
        $response->assertDontSee('This is a SECRET INTERNAL note.');
    }

    public function test_client_cannot_access_other_organization_tickets()
    {
        $orgA = Organization::create(['name' => 'Org A']);
        $orgB = Organization::create(['name' => 'Org B']);
        
        $clientA = User::create([
            'name' => 'Client A',
            'email' => 'clientA@orga.test',
            'password' => bcrypt('password'),
            'role' => 'client',
            'organization_id' => $orgA->id,
        ]);

        $clientB = User::create([
            'name' => 'Client B',
            'email' => 'clientB@orgb.test',
            'password' => bcrypt('password'),
            'role' => 'client',
            'organization_id' => $orgB->id,
        ]);

        $ticketB = Ticket::create([
            'organization_id' => $orgB->id,
            'user_id' => $clientB->id,
            'title' => 'Ticket B',
            'description' => 'Issue B',
            'priority' => 'normal',
            'status' => 'open',
        ]);

        // Client A mencoba mengakses URL tiket milik Org B
        $response = $this->actingAs($clientA)->get(route('client.tickets.show', $ticketB->id));

        // Pastikan akses ditolak (403 Forbidden)
        $response->assertStatus(403);
    }
}