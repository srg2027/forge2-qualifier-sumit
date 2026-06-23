<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request): mixed
    {
        $validated = $request->validate([
            'board_id' => ['sometimes', 'integer', 'exists:boards,id'],
        ]);

        return Task::query()
            ->with('board:id,name')
            ->when($validated['board_id'] ?? null, fn ($query, $boardId) => $query->where('board_id', $boardId))
            ->latest()
            ->get();
    }

    public function store(Request $request): mixed
    {
        $validated = $this->validatedTask($request);

        return response()->json(
            Task::create($validated)->load('board:id,name'),
            Response::HTTP_CREATED,
        );
    }

    public function show(Task $task): Task
    {
        return $task->load('board:id,name');
    }

    public function update(Request $request, Task $task): Task
    {
        $task->update($this->validatedTask($request));

        return $task->load('board:id,name');
    }

    public function destroy(Task $task): mixed
    {
        $task->delete();

        return response()->noContent();
    }

    public function updateStatus(Request $request, Task $task): Task
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(Task::STATUSES)],
        ]);

        $task->update($validated);

        return $task->load('board:id,name');
    }

    private function validatedTask(Request $request): array
    {
        return $request->validate([
            'board_id' => ['required', 'integer', 'exists:boards,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', Rule::in(Task::STATUSES)],
        ]);
    }
}
