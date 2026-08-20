export function recordFileTouch(tasks, filePath) {
  const active = tasks.find(t => t.state === 'IN_PROGRESS');
  if (!active) return;
  if (!active.files.includes(filePath)) active.files.push(filePath);
}
