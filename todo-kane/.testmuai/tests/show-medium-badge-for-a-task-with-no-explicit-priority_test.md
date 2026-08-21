---
assurance:
  id: t-6
  base: sha256:a9e632268275cc72b1ccf48160d56014a9d8f746797381a246b07e4c18e5092b
---
# Show Medium badge for a task with no explicit priority

> Prove that a task without an explicit priority displays the default Medium badge.

## Import: t-1

@import ./create-one-task-by-pressing-enter-after-typing-a-title_test.md

## Step 1

At {{start_url}}, on the TodoMVC page with the task titled "Buy milk" created by the reused setup visible in the list, locate that task card and inspect the priority badge and existing controls shown on it.

## Step 2

Assert that the task card titled "Buy milk" shows a visible priority badge whose text is exactly Medium.

## Step 3

Assert that the same task card still shows its completion checkbox and delete "x" control.

## Step 4

Confirm absolute check: Medium (equals) — the stated promise: A task card without an explicit priority shows Medium on its badge.

## Step 5 — assert @verifies ac-14, ac-8, ac-9, ac-10, ac-11, ac-12

Confirm absolute check: Medium (equals) — the stated promise: A task card without an explicit priority shows Medium on its badge.
