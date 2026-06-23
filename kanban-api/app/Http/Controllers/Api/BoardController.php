<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BoardController extends Controller
{
    public function index(): mixed
    {
        return Board::query()
            ->with(['tasks' => fn ($query) => $query->latest()])
            ->latest()
            ->get();
    }

    public function store(Request $request): mixed
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(
            Board::create($validated)->load('tasks'),
            Response::HTTP_CREATED,
        );
    }

    public function show(Board $board): Board
    {
        return $board->load(['tasks' => fn ($query) => $query->latest()]);
    }

    public function update(Request $request, Board $board): Board
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $board->update($validated);

        return $board->load(['tasks' => fn ($query) => $query->latest()]);
    }

    public function destroy(Board $board): mixed
    {
        $board->delete();

        return response()->noContent();
    }
}
