<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AgentWorkflowController extends Controller
{
    public function store(Request $request): mixed
    {
        $event = $request->validate([
            'event' => ['required', 'string', 'max:80'],
            'task.id' => ['nullable', 'integer'],
            'task.title' => ['nullable', 'string', 'max:255'],
            'task.status' => ['nullable', 'string', 'max:80'],
            'board.id' => ['nullable', 'integer'],
            'board.name' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $payload = [
            'source' => 'forge2-kanban',
            'model' => 'google/gemini-2.5-flash',
            'channels' => config('services.agents.slack_channels'),
            ...$event,
        ];

        $deliveries = [
            'hermes' => $this->postWebhook(config('services.agents.hermes_webhook_url'), $payload),
            'openclaw' => $this->postWebhook(config('services.agents.openclaw_webhook_url'), $payload),
            'slack' => $this->postSlack($payload),
        ];

        Log::info('Kanban agent workflow event', [
            'payload' => $payload,
            'deliveries' => $deliveries,
        ]);

        return response()->json([
            'queued' => true,
            'deliveries' => $deliveries,
        ]);
    }

    private function postWebhook(?string $url, array $payload): array
    {
        if (! $url) {
            return ['configured' => false];
        }

        try {
            $response = Http::timeout(8)->post($url, $payload);

            return [
                'configured' => true,
                'ok' => $response->successful(),
                'status' => $response->status(),
            ];
        } catch (ConnectionException $exception) {
            return [
                'configured' => true,
                'ok' => false,
                'error' => $exception->getMessage(),
            ];
        }
    }

    private function postSlack(array $payload): array
    {
        $url = config('services.agents.slack_webhook_url');

        if (! $url) {
            return ['configured' => false];
        }

        $message = $payload['message'] ?? sprintf(
            '[%s] %s',
            $payload['event'],
            $payload['task']['title'] ?? $payload['board']['name'] ?? 'Kanban update',
        );

        return $this->postWebhook($url, [
            'text' => $message,
            'blocks' => [
                [
                    'type' => 'section',
                    'text' => [
                        'type' => 'mrkdwn',
                        'text' => "*Forge2 Kanban*\n{$message}",
                    ],
                ],
            ],
        ]);
    }
}
