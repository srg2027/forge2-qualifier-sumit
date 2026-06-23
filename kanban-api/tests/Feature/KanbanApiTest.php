<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KanbanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_boards_can_be_created_listed_updated_and_deleted(): void
    {
        $createResponse = $this->postJson('/api/boards', [
            'name' => 'Forge2 Sprint',
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('name', 'Forge2 Sprint')
            ->assertJsonPath('tasks', []);

        $boardId = $createResponse->json('id');

        $this->getJson('/api/boards')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Forge2 Sprint']);

        $this->putJson("/api/boards/{$boardId}", [
            'name' => 'Qualifier Sprint',
        ])
            ->assertOk()
            ->assertJsonPath('name', 'Qualifier Sprint');

        $this->deleteJson("/api/boards/{$boardId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('boards', ['id' => $boardId]);
    }

    public function test_tasks_can_be_created_updated_moved_and_deleted(): void
    {
        $board = Board::create(['name' => 'AI Kanban']);

        $createResponse = $this->postJson('/api/tasks', [
            'board_id' => $board->id,
            'title' => 'Wire Hermes workflow',
            'description' => 'Send task movement events to the existing agent workflow.',
            'status' => Task::STATUS_TODO,
        ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('title', 'Wire Hermes workflow')
            ->assertJsonPath('status', Task::STATUS_TODO);

        $taskId = $createResponse->json('id');

        $this->putJson("/api/tasks/{$taskId}", [
            'board_id' => $board->id,
            'title' => 'Wire Hermes workflow',
            'description' => 'Emit updates for Slack-connected agents.',
            'status' => Task::STATUS_IN_PROGRESS,
        ])
            ->assertOk()
            ->assertJsonPath('description', 'Emit updates for Slack-connected agents.')
            ->assertJsonPath('status', Task::STATUS_IN_PROGRESS);

        $this->patchJson("/api/tasks/{$taskId}/status", [
            'status' => Task::STATUS_DONE,
        ])
            ->assertOk()
            ->assertJsonPath('status', Task::STATUS_DONE);

        $this->getJson("/api/tasks?board_id={$board->id}")
            ->assertOk()
            ->assertJsonFragment(['title' => 'Wire Hermes workflow']);

        $this->deleteJson("/api/tasks/{$taskId}")
            ->assertNoContent();

        $this->assertDatabaseMissing('tasks', ['id' => $taskId]);
    }

    public function test_task_status_must_be_valid(): void
    {
        $task = Task::create([
            'board_id' => Board::create(['name' => 'Validation'])->id,
            'title' => 'Bad move',
            'status' => Task::STATUS_TODO,
        ]);

        $this->patchJson("/api/tasks/{$task->id}/status", [
            'status' => 'blocked',
        ])->assertUnprocessable();
    }

    public function test_agent_events_are_accepted_without_live_webhooks(): void
    {
        $this->postJson('/api/agent/events', [
            'event' => 'task.moved',
            'task' => [
                'id' => 10,
                'title' => 'Ship board',
                'status' => Task::STATUS_DONE,
            ],
            'board' => [
                'id' => 5,
                'name' => 'Forge2 Sprint',
            ],
            'message' => 'Ship board moved to Done',
        ])
            ->assertOk()
            ->assertJsonPath('queued', true)
            ->assertJsonPath('deliveries.hermes.configured', false)
            ->assertJsonPath('deliveries.slack.configured', false);
    }
}
