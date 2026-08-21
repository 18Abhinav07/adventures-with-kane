---
assurance:
  id: t-1
  base: sha256:3156da02c08c40f8cc49bde13a99af70af323c448133967bf76868eb7113d6c5
---
# Create one task by pressing Enter after typing a title

> Prove that typing a task title and pressing Enter creates one new task in the todo list and shows that typed title in the list.

## Step 1

Open {{start_url}} in a browser and wait until the todo list page is fully loaded.

## Step 2

capture baseline: number of currently visible tasks in the todo list as baseline_task_count.

## Step 3

On the todo list page, in the task title input, enter "Buy milk" and submit it by pressing Enter.

## Step 4

Assert that the visible todo list now shows exactly baseline_task_count + 1 tasks.

## Step 5

Assert that the visible todo list shows a task whose title is exactly "Buy milk".

## Step 6 — assert @verifies ac-1, ac-2

Confirm delta check: 1 (changed-by) — the stated promise: When the user presses Enter after typing a task title, the todo list gains exactly one additional task.
