---
test: ../view-stored-high-and-low-priority-badges-on-task-cards_test.md
status: passed
started: 2026-08-20T11:49:01.540Z
duration_s: 202
session_id: 4f45445a-9ad1-4fd4-b897-748c6bde7d46
---

# View stored High and Low priority badges on task cards — Result

## Step 1 ✓ passed (51.5s)
md5: c143806fe419b25d5692a960b6f0daee
Open {{start_url}} in a browser and wait until the TodoMVC page is fully loaded. In the new-task input, create a task titled "{{high_priority_task_title}} !high" by pressing Enter, then create a second task titled "{{low_priority_task_title}} !low" by pressing Enter, so both tasks are stored with their explicit priority and visible in the list titled {{high_priority_task_title}} and {{low_priority_task_title}} respectively (the "!high"/"!low" tag is stripped from the displayed title).

## Step 2 ✓ passed (15.4s)
md5: 42ddd2d14bb5b8f06d58df5131d17117
On the TodoMVC page, locate the task card titled {{high_priority_task_title}} and inspect the priority badge and existing controls shown on that card.

## Step 3 ✓ passed (29.3s)
md5: 6909a84c62ec843aab177711c8af5d7c
Assert that the task card titled {{high_priority_task_title}} shows a visible priority badge whose text is exactly High, and that the same card still shows its completion checkbox and delete "x" control.

## Step 4 ✓ passed (13.8s)
md5: c405cd6394460ab87f6fac1f34801d56
On the TodoMVC page, locate the task card titled {{low_priority_task_title}} and inspect the priority badge and existing controls shown on that card.

## Step 5 ✓ passed (29.3s)
md5: a121076906907cdcfc6a48135c41ed29
Assert that the task card titled {{low_priority_task_title}} shows a visible priority badge whose text is exactly Low, and that the same card still shows its completion checkbox and delete "x" control.

## Step 6 ✓ passed (24s)
md5: 3eb40a3f09762b0de3355532a7b9ca3b
Confirm propagation check: the task card's stored priority value (equals) — the stated promise: A task card with an explicit High or Low priority shows that same priority value on its badge.

## Step 7 — assert ✓ passed (35.8s)
md5: 3eb40a3f09762b0de3355532a7b9ca3b
Confirm propagation check: the task card's stored priority value (equals) — the stated promise: A task card with an explicit High or Low priority shows that same priority value on its badge.
