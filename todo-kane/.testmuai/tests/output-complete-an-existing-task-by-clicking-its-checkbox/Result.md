---
test: ../complete-an-existing-task-by-clicking-its-checkbox_test.md
status: passed
started: 2026-08-20T11:20:50.897Z
duration_s: 119
session_id: a6e94211-8e4d-4fe8-81f8-ad5c10ad2719
---

# Complete an existing task by clicking its checkbox — Result

## Import: t-1 ✓ passed (via @import ./create-one-task-by-pressing-enter-after-typing-a-title_test.md — 6 inlined steps, 2.7199999999999998s → ../output-create-one-task-by-pressing-enter-after-typing-a-title/Result.md)
md5: f6402afed3c70b4b551de5f08e0d15e0

## Step 1 ✓ passed (19.7s)
md5: 73e49785103bfd371591c99668cd0431
Stay on the current page (do not reopen or reload {{start_url}}) and wait until the todo list page shows the task titled "Buy milk" that was just created by the reused setup, still visible in the list.

## Step 2 ✓ passed (32.9s)
md5: e561bd29545cd8a74fc50e58fa756113
Store the completion state of the task titled "Buy milk" as baseline_completion_state, confirming that its checkbox is not checked and its title is not shown with strikethrough styling before any action.

## Step 3 ✓ passed (12.9s)
md5: f65927082cf5cc35b50aace5e58a3b37
On the todo list page, in the row for the task titled "Buy milk", click its checkbox to mark that task complete.

## Step 4 ✓ passed (24.6s)
md5: 4b904ae62415a505b5a365459981d725
Assert that the same task row is now shown as completed and that the task title is rendered with strikethrough styling.

## Step 5 — assert ✓ passed (24.1s)
md5: d64108a3fc0a6d9d937bea01944a81e6
Confirm state-transition check: completed (equals) — the stated promise: Clicking an existing task's checkbox changes that task from not completed to completed.
