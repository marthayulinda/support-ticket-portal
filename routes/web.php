<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AgentTicketController;
use App\Http\Controllers\ClientTicketController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function (Request $request) {
    if ($request->user()->isAgent()) {
        return redirect()->route('agent.tickets.index');
    }

    return redirect()->route('client.tickets.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Routes untuk Client
Route::middleware(['auth'])->prefix('client')->group(function () {
    Route::get('/tickets', [ClientTicketController::class, 'index'])->name('client.tickets.index');
    Route::get('/tickets/create', [ClientTicketController::class, 'create'])->name('client.tickets.create');
    Route::post('/tickets', [ClientTicketController::class, 'store'])->name('client.tickets.store');
    Route::get('/tickets/{ticket}', [ClientTicketController::class, 'show'])->name('client.tickets.show');
    Route::post('/tickets/{ticket}/reply', [ClientTicketController::class, 'storeReply'])->name('client.tickets.reply');
});

// Routes untuk Agent
Route::middleware(['auth'])->prefix('agent')->group(function () {
    Route::get('/tickets', [AgentTicketController::class, 'index'])->name('agent.tickets.index');
    Route::get('/tickets/{ticket}', [AgentTicketController::class, 'show'])->name('agent.tickets.show');
    Route::post('/tickets/{ticket}/reply', [AgentTicketController::class, 'storeReply'])->name('agent.tickets.reply');
    Route::patch('/tickets/{ticket}/update', [AgentTicketController::class, 'updateTicket'])->name('agent.tickets.update');
    Route::patch('/tickets/{ticket}/assign', [AgentTicketController::class, 'assign'])->name('agent.tickets.assign');
});

require __DIR__ . '/auth.php';
