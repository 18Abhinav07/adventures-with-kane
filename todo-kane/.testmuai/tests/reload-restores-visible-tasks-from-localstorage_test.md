---
assurance:
  id: t-4
  base: sha256:ec0341c7a5e09059738696d1b23b8ab5b7d3d90789e9aa5e8498d0f7afca4d93
---
# Reload restores visible tasks from localStorage

> Prove that tasks already visible in the list remain visible after a browser page reload, across representative list sizes of one and several tasks.

## Step 1

Open {{start_url}} in a fresh browser session and wait for the Todo application to finish loading.

## Step 2

In the new-task input, create one task titled "reload-persist-one" and confirm it is visible in the task list.

## Step 3

In the browser's DevTools for the application's origin, verify that a localStorage entry contains persisted task-list data including "reload-persist-one"; store the visible task titles shown in the task list as baseline_titles_one.

## Step 4

Reload the current page and confirm the task list is restored; verify that the visible task titles equal baseline_titles_one and still include "reload-persist-one".

## Step 5

Using the same task-entry control, add two more tasks titled "reload-persist-two" and "reload-persist-three" so the list contains three distinct visible tasks.

## Step 6

In the browser's DevTools for the application's origin, verify that a localStorage entry contains persisted task-list data including "reload-persist-one", "reload-persist-two", and "reload-persist-three"; store the visible task titles shown in the task list as baseline_titles_three.

## Step 7

Reload the current page again and confirm the visible task titles equal baseline_titles_three and still include "reload-persist-one", "reload-persist-two", and "reload-persist-three".

## Step 8 — assert @verifies ac-6, ac-7

Confirm presence check: Each task visible immediately before the page reload remains visible immediately after the reload. (forall) — the stated promise: Each task visible immediately before the page reload remains visible immediately after the reload.
