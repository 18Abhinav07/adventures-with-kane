# GuardianKane Task Tracker

```yaml
- id: T0
  title: Scaffold — clone + boot
  prd_ref: null
  verification_mode: kane
  test_file: null
  depends_on: []
  state: KANE_VERIFIED
  attempts: 1
  files: []
  last_run: 2026-08-20T10:52:00Z ad-hoc kane-cli run
  last_verdict: passed
- id: T1
  title: Add task
  prd_ref: PRD.md#L3-4
  verification_mode: kane
  test_file: .testmuai/tests/create-one-task-by-pressing-enter-after-typing-a-title_test.md
  depends_on:
    - T0
  state: KANE_VERIFIED
  attempts: 2
  files:
    - src/todo/components/header.jsx
    - src/todo/components/input.jsx
    - src/todo/reducer.js
    - src/todo/components/main.jsx
    - lib/kane.js
  last_run: '2026-08-20T11:15:29.074Z'
  last_verdict:
    type: run_end
    run_id: run-5
    status: passed
    summary: ''
    reason: replay completed
    duration: 0.07
    final_url: http://localhost:8080/
    actions_executed: 2
    screenshot_path: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/c047356c-f052-4534-8cb9-36cf9b6b91ca/scratch/5/replay-test/screenshots/step_002.png
    run_dir: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/c047356c-f052-4534-8cb9-36cf9b6b91ca/scratch/5/replay-test
    total_runs: 1
    context:
      memory: {}
      variables:
        todo_list_gains_one_additional_task_check:
          syntax: '{{todo_list_gains_one_additional_task_check}}'
          value: '1'
          secret: false
      pointer: ''
    variables_out:
      todo_list_gains_one_additional_task_check:
        syntax: '{{todo_list_gains_one_additional_task_check}}'
        value: '1'
        secret: false
    store_out: {}
    result_code: 100
    reason_code: success.complete
- id: T2
  title: Complete task (structural-preservation on existing strikethrough CSS)
  prd_ref: PRD.md#L6-9
  verification_mode: kane
  test_file: .testmuai/tests/complete-an-existing-task-by-clicking-its-checkbox_test.md
  depends_on:
    - T1
  state: KANE_VERIFIED
  attempts: 1
  files:
    - src/todo/components/item.jsx
    - src/todo/reducer.js
    - .testmuai/tests/complete-an-existing-task-by-clicking-its-checkbox_test.md
  last_run: '2026-08-20T11:20:46.616Z'
  last_verdict:
    type: run_end
    status: passed
    summary: |-
      The run checked whether clicking an existing task’s checkbox would mark the task as completed.
      It opened the task page on localhost and clicked the existing task’s checkbox.
      The checkbox changed to the checked state, so the task was successfully marked as completed.
    one_liner: completed a task on localhost
    final_state:
      url: http://localhost:8080/
      task_checkbox_checked: 'true'
    reason: Objective completed
    duration: 24.1
    bifurcated: false
    total_runs: 1
    context:
      memory:
        task_checkbox_state_transition_check:
          extracted_value: 'true'
          operator: equals
          transforms: []
          json_path: null
          reasoning: 'value: ''true'' -> ''true''; equals ''true'' -> PASS'
          analyzer_type: textual_visual
          step: 1
          query: whether the existing task's checkbox is checked
          condition: Clicking an existing task's checkbox changes that task from not completed to completed.
          human_description: Checking whether the existing task's checkbox is checked
          expected_value: 'true'
          code_js: el(10)?.checked ?? null
          wrapped_js: |-
            (els) => {
              const __m = {10: 0};
              const el = (i) => els[__m[i]];
              const __v = (el(10)?.checked ?? null);
              return (typeof __v === 'boolean' ? String(__v) : __v);
            }
          locators:
            - internal:testid=[data-testid="todo-item-toggle"s]
          needs_unit_conversion: false
      variables:
        task_checkbox_state_transition_check:
          syntax: '{{task_checkbox_state_transition_check}}'
          value: 'true'
          type: memory
          secret: false
      pointer: (passed) completed a task on localhost
    credits_consumed: 6.679085000000001
    session_dir: /Users/18abhinav07/.testmuai/kaneai/sessions/a6e94211-8e4d-4fe8-81f8-ad5c10ad2719
    run_dir: /Users/18abhinav07/.testmuai/kaneai/sessions/a6e94211-8e4d-4fe8-81f8-ad5c10ad2719/runs/10
    result_code: 100
    reason_code: success.complete
    per_flow_metadata:
      - result_code: '100'
        reason_code: success.complete
        error_message: null
        summary: >-
          The run checked whether clicking an existing task’s checkbox would mark the task as
          completed.

          It opened the task page on localhost and clicked the existing task’s checkbox.

          The checkbox changed to the checked state, so the task was successfully marked as
          completed.
        one_liner: completed a task on localhost
        credits_consumed: 6.679085000000001
    run_id: run-10
- id: T3
  title: Delete task (structural-preservation on card layout)
  prd_ref: PRD.md#L6-9
  verification_mode: kane
  test_file: .testmuai/tests/delete-one-existing-task-by-clicking-its-x-control_test.md
  depends_on:
    - T1
  state: KANE_VERIFIED
  attempts: 1
  files:
    - src/todo/components/item.jsx
    - src/todo/reducer.js
    - .testmuai/tests/delete-one-existing-task-by-clicking-its-x-control_test.md
  last_run: '2026-08-20T11:26:03.758Z'
  last_verdict:
    type: run_end
    status: passed
    summary: >-
      The run checked whether clicking a task’s “x” button would remove that task from the todo
      list.

      After the “x” control was activated, the page showed that the todo list was empty.

      The task did not remain visible, so the removal worked as expected.
    one_liner: verified task removal on localhost
    final_state:
      url: http://localhost:8080/
      todo_items_remaining: '0'
      task_removed_successfully: 'true'
      removed_task_still_visible: 'false'
    reason: Objective completed
    duration: 30.5
    bifurcated: false
    total_runs: 1
    context:
      memory:
        removed_task_not_visible_check:
          extracted_value: 'false'
          operator: equals
          transforms: []
          json_path: null
          reasoning: 'value: ''false'' -> ''false''; equals ''false'' -> PASS'
          analyzer_type: textual_visual
          step: 1
          query: whether any task is present in the todo list after the activated task was removed
          condition: >-
            the task whose "x" control was activated remains visible in the todo list does NOT
            appear (forbidden-presence)
          human_description: Checking whether any task is present in the todo list after removal
          expected_value: 'false'
          code_js: el(1).querySelector('ul.todo-list li') !== null
          wrapped_js: |-
            (els) => {
              const __m = {1: 0};
              const el = (i) => els[__m[i]];
              const __v = (el(1).querySelector('ul.todo-list li') !== null);
              return (typeof __v === 'boolean' ? String(__v) : __v);
            }
          locators:
            - internal:text="todosToggle All Input0 items"i
          needs_unit_conversion: false
        x_control_removes_task_check:
          extracted_value: 'true'
          operator: equals
          transforms: []
          json_path: null
          reasoning: 'value: ''true'' -> ''true''; equals ''true'' -> PASS'
          analyzer_type: textual_visual
          step: 1
          query: whether the todo list is empty after activating a task's x control
          condition: Activating a task's "x" control removes that task from the todo list
          human_description: Checking whether activating a task's x control empties the todo list
          expected_value: 'true'
          code_js: el(1).querySelectorAll('ul.todo-list li').length === 0
          wrapped_js: |-
            (els) => {
              const __m = {1: 0};
              const el = (i) => els[__m[i]];
              const __v = (el(1).querySelectorAll('ul.todo-list li').length === 0);
              return (typeof __v === 'boolean' ? String(__v) : __v);
            }
          locators:
            - internal:text="todosToggle All Input0 items"i
          needs_unit_conversion: false
      variables:
        removed_task_not_visible_check:
          syntax: '{{removed_task_not_visible_check}}'
          value: 'false'
          type: memory
          secret: false
        x_control_removes_task_check:
          syntax: '{{x_control_removes_task_check}}'
          value: 'true'
          type: memory
          secret: false
      pointer: (passed) verified task removal on localhost
    credits_consumed: 7.9734799999999995
    session_dir: /Users/18abhinav07/.testmuai/kaneai/sessions/f352c440-61cf-4777-acfc-046a9d2e7b2a
    run_dir: /Users/18abhinav07/.testmuai/kaneai/sessions/f352c440-61cf-4777-acfc-046a9d2e7b2a/runs/5
    result_code: 100
    reason_code: success.complete
    per_flow_metadata:
      - result_code: '100'
        reason_code: success.complete
        error_message: null
        summary: >-
          The run checked whether clicking a task’s “x” button would remove that task from the todo
          list.

          After the “x” control was activated, the page showed that the todo list was empty.

          The task did not remain visible, so the removal worked as expected.
        one_liner: verified task removal on localhost
        credits_consumed: 7.9734799999999995
    run_id: run-5
- id: T4
  title: Persistence (localStorage)
  prd_ref: PRD.md#L16-17
  verification_mode: kane
  test_file: .testmuai/tests/reload-restores-visible-tasks-from-localstorage_test.md
  depends_on:
    - T1
    - T2
    - T3
  state: KANE_VERIFIED
  attempts: 1
  files:
    - src/todo/app.jsx
  last_run: '2026-08-20T11:39:40.836Z'
  last_verdict:
    type: run_end
    run_id: run-7
    status: passed
    summary: ''
    reason: replay completed
    duration: 0.08
    final_url: http://localhost:8080/
    actions_executed: 2
    screenshot_path: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/f285385d-4563-4d93-980c-700f043a6152/scratch/7/replay-test/screenshots/step_002.png
    run_dir: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/f285385d-4563-4d93-980c-700f043a6152/scratch/7/replay-test
    total_runs: 1
    context:
      memory: {}
      variables:
        tasks_remain_visible_after_reload_check:
          syntax: '{{tasks_remain_visible_after_reload_check}}'
          value: 'true'
          secret: false
      pointer: ''
    variables_out:
      tasks_remain_visible_after_reload_check:
        syntax: '{{tasks_remain_visible_after_reload_check}}'
        value: 'true'
        secret: false
    store_out: {}
    result_code: 100
    reason_code: success.complete
- id: T5
  title: Priority badge (structural-preservation on existing card UI)
  prd_ref: PRD.md#L11-14
  verification_mode: kane
  test_file:
    - .testmuai/tests/show-medium-badge-for-a-task-with-no-explicit-priority_test.md
    - .testmuai/tests/view-stored-high-and-low-priority-badges-on-task-cards_test.md
  depends_on:
    - T1
  state: KANE_VERIFIED
  attempts: 0
  files:
    - src/todo/reducer.js
    - src/todo/components/item.jsx
    - src/todo/components/header.jsx
    - src/todo/app.css
    - lib/kane.js
    - .testmuai/tests/view-stored-high-and-low-priority-badges-on-task-cards_test.md
  last_run: '2026-08-20T11:54:51.261Z'
  last_verdict:
    type: run_end
    run_id: run-6
    status: passed
    summary: ''
    reason: replay completed
    duration: 0.08
    final_url: http://localhost:8080/
    actions_executed: 2
    screenshot_path: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/61ebb3be-ef02-454c-a04a-f97b7794cdee/scratch/6/replay-test/screenshots/step_002.png
    run_dir: >-
      /Users/18abhinav07/.testmuai/kaneai/sessions/61ebb3be-ef02-454c-a04a-f97b7794cdee/scratch/6/replay-test
    total_runs: 1
    context:
      memory: {}
      variables:
        task_card_priority_badge_match_check:
          syntax: '{{task_card_priority_badge_match_check}}'
          value: 'true'
          secret: false
      pointer: ''
    variables_out:
      task_card_priority_badge_match_check:
        syntax: '{{task_card_priority_badge_match_check}}'
        value: 'true'
        secret: false
    store_out: {}
    result_code: 100
    reason_code: success.complete

```
