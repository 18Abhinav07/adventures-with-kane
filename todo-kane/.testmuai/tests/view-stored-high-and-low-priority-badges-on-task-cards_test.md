---
assurance:
  id: t-5
  base: sha256:bf2c8f5bd02af15b04772e6fec8e5b3929d8e4f973f8edf229e25fc6d76dc6f2
---
# View stored High and Low priority badges on task cards

> Prove that a task with an explicit stored priority shows that same allowed value on its badge for the non-default allowed values.

## Step 1

Open {{start_url}} in a browser and wait until the TodoMVC page is fully loaded. In the new-task input, create a task titled "{{high_priority_task_title}} !high" by pressing Enter, then create a second task titled "{{low_priority_task_title}} !low" by pressing Enter, so both tasks are stored with their explicit priority and visible in the list titled {{high_priority_task_title}} and {{low_priority_task_title}} respectively (the "!high"/"!low" tag is stripped from the displayed title).

## Step 2

On the TodoMVC page, locate the task card titled {{high_priority_task_title}} and inspect the priority badge and existing controls shown on that card.

## Step 3

Assert that the task card titled {{high_priority_task_title}} shows a visible priority badge whose text is exactly High, and that the same card still shows its completion checkbox and delete "x" control.

## Step 4

On the TodoMVC page, locate the task card titled {{low_priority_task_title}} and inspect the priority badge and existing controls shown on that card.

## Step 5

Assert that the task card titled {{low_priority_task_title}} shows a visible priority badge whose text is exactly Low, and that the same card still shows its completion checkbox and delete "x" control.

## Step 6

Confirm propagation check: the task card's stored priority value (equals) — the stated promise: A task card with an explicit High or Low priority shows that same priority value on its badge.

## Step 7 — assert @verifies ac-13, ac-8, ac-9, ac-11, ac-12

Confirm propagation check: the task card's stored priority value (equals) — the stated promise: A task card with an explicit High or Low priority shows that same priority value on its badge.
