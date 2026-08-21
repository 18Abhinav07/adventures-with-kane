---
test: ../delete-one-existing-task-by-clicking-its-x-control_test.md
status: passed
started: 2026-08-20T11:26:07.698Z
duration_s: 110
session_id: f352c440-61cf-4777-acfc-046a9d2e7b2a
---

# Delete one existing task by clicking its x control — Result

## Step 1 ✓ passed (0.69s)
md5: fe00cc5a5f0ebe3d579d2ac3fcccc464
Open {{start_url}} in a browser and wait until the todo list page is fully loaded.

## Step 2 ✓ passed (1.75s)
md5: e0164759c675610915b8368440dcec81
On the todo list page, create one task titled "Task to delete" by using the task-title input and its Enter submission flow.

## Step 3 ✓ passed (0.08s)
md5: b25d2b6fcab9c36e33b750671777359c
Assert that the visible todo list shows a task whose title is exactly "Task to delete" before deletion.

## Step 4 ✓ passed (51.7s)
md5: d0eddd7c09a22aea7021376ba8bd40ba
On the task row titled "Task to delete", first hover over that row to reveal its hidden "x" delete control, then click it to activate the delete action.

## Step 5 ✓ passed (22.9s)
md5: 19fffedebd48814118965b69fdf43c6a
Assert that the visible todo list no longer shows any task whose title is exactly "Task to delete".

## Step 6 — assert ✓ passed (30.5s)
md5: b09396086cb3c3cbf135e3412084130d
Confirm 'the task whose "x" control was activated remains visible in the todo list' does NOT appear (forbidden-presence) — the stated promise: Activating a task's "x" control removes that task from the todo list.
