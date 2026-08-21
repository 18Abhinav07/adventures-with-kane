---
assurance:
  id: t-2
  base: sha256:e51061f89696a2d0c1d2740da3f0327a76926e69cc470a0feb574392b1786c53
---
# Complete an existing task by clicking its checkbox

> Prove that clicking an existing incomplete task's checkbox marks that task complete and shows the completed presentation.

## Import: t-1

@import ./create-one-task-by-pressing-enter-after-typing-a-title_test.md

## Step 1

Stay on the current page (do not reopen or reload {{start_url}}) and wait until the todo list page shows the task titled "Buy milk" that was just created by the reused setup, still visible in the list.

## Step 2

Store the completion state of the task titled "Buy milk" as baseline_completion_state, confirming that its checkbox is not checked and its title is not shown with strikethrough styling before any action.

## Step 3

On the todo list page, in the row for the task titled "Buy milk", click its checkbox to mark that task complete.

## Step 4

Assert that the same task row is now shown as completed and that the task title is rendered with strikethrough styling.

## Step 5 — assert @verifies ac-3, ac-4

Confirm state-transition check: completed (equals) — the stated promise: Clicking an existing task's checkbox changes that task from not completed to completed.
