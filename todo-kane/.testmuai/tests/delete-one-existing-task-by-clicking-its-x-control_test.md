---
assurance:
  id: t-3
  base: sha256:5cdfbfb9a7824d62e5a1b18dce98cda8a500568dc9448fd046e323fdd075292e
---
# Delete one existing task by clicking its x control

> Prove that clicking a task's "x" control removes that existing task from the todo list.

## Step 1

Open {{start_url}} in a browser and wait until the todo list page is fully loaded.

## Step 2

On the todo list page, create one task titled "Task to delete" by using the task-title input and its Enter submission flow.

## Step 3

Assert that the visible todo list shows a task whose title is exactly "Task to delete" before deletion.

## Step 4

On the task row titled "Task to delete", first hover over that row to reveal its hidden "x" delete control, then click it to activate the delete action.

## Step 5

Assert that the visible todo list no longer shows any task whose title is exactly "Task to delete".

## Step 6 — assert @verifies ac-5

Confirm 'the task whose "x" control was activated remains visible in the todo list' does NOT appear (forbidden-presence) — the stated promise: Activating a task's "x" control removes that task from the todo list.
