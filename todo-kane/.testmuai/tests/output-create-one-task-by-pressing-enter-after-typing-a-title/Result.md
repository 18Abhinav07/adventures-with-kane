---
test: ../create-one-task-by-pressing-enter-after-typing-a-title_test.md
status: passed
started: 2026-08-20T11:11:51.780Z
duration_s: 186
session_id: ba50dca5-2178-4ac2-9469-854376914e57
---

# Create one task by pressing Enter after typing a title — Result

## Step 1 ✓ passed (17.2s)
md5: fe00cc5a5f0ebe3d579d2ac3fcccc464
Open {{start_url}} in a browser and wait until the todo list page is fully loaded.

## Step 2 ✓ passed (33.4s)
md5: 2fbf68ce8640491227439fccc1d04cbf
capture baseline: number of currently visible tasks in the todo list as baseline_task_count.

## Step 3 ✓ passed (25.2s)
md5: a6907763a5a2e1bd42e0cc10e66446c9
On the todo list page, in the task title input, enter "Buy milk" and submit it by pressing Enter.

## Step 4 ✓ passed (24.4s)
md5: e4608bf05732da5d3ee0b2f7bb696393
Assert that the visible todo list now shows exactly baseline_task_count + 1 tasks.

## Step 5 ✓ passed (17s)
md5: 38b804fdc69d068fa9255d1abcd92abb
Assert that the visible todo list shows a task whose title is exactly "Buy milk".

## Step 6 — assert ✓ passed (66.5s)
md5: 9986630cea11f92821efeaedc2e33572
Confirm delta check: 1 (changed-by) — the stated promise: When the user presses Enter after typing a task title, the todo list gains exactly one additional task.
