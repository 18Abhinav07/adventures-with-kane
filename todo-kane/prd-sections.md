# PRD Sections — Confirmed Use-Cases

Confirmed during the GuardianKane grilling conversation on 2026-08-20.

## UC1 — Add task
**Wording:** User can type a task title and press Enter to add it to the list.
**verification_mode:** kane
**prd_ref:** PRD.md#L3-4

## UC2 — Complete task
**Wording:** User can click a checkbox to mark a task complete (strikethrough style, already partially supported by the template's CSS classes).
**Extra assertion:** Kane must also verify the existing "completed" CSS class / strikethrough styling is unchanged after this change (structural-preservation).
**verification_mode:** kane
**prd_ref:** PRD.md#L6-9

## UC3 — Delete task
**Wording:** User can click an "x" to delete a task.
**Extra assertion:** Kane must also verify the rest of the card (title, checkbox, layout) and other tasks are unaffected by a delete action (structural-preservation).
**verification_mode:** kane
**prd_ref:** PRD.md#L6-9

## UC4 — Persistence
**Wording:** Tasks survive a page reload (localStorage).
**verification_mode:** kane
**prd_ref:** PRD.md#L16-17

## UC5 — Priority badge
**Wording:** Add a priority badge to each task card — the existing card UI, controls, and layout stay as they are today, just with a small badge showing High/Medium/Low priority somewhere on the card, defaulting to Medium.
**Extra assertion:** Kane must also verify existing card elements/controls/layout are still present and unchanged after the badge is added (structural-preservation).
**verification_mode:** kane
**prd_ref:** PRD.md#L11-14
