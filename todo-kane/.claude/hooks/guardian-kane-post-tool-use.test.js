import { describe, it, expect } from 'vitest';
import { recordFileTouch } from './guardian-kane-post-tool-use.js';

describe('recordFileTouch', () => {
  it('appends a new file to the IN_PROGRESS task', () => {
    const tasks = [{ id: 'T1', state: 'IN_PROGRESS', files: [] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual(['src/App.jsx']);
  });

  it('dedupes repeated touches of the same file', () => {
    const tasks = [{ id: 'T1', state: 'IN_PROGRESS', files: ['src/App.jsx'] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual(['src/App.jsx']);
  });

  it('is a no-op when no task is IN_PROGRESS (e.g. during CLAIMED_DONE or KANE_VERIFYING)', () => {
    const tasks = [{ id: 'T1', state: 'CLAIMED_DONE', files: [] }];
    recordFileTouch(tasks, 'src/App.jsx');
    expect(tasks[0].files).toEqual([]);
  });
});
