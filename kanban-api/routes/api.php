<?php

use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\AgentWorkflowController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::post('agent/events', [AgentWorkflowController::class, 'store']);
Route::apiResource('boards', BoardController::class);
Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus']);
Route::apiResource('tasks', TaskController::class);
