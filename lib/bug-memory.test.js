import { describe, it, expect } from 'vitest';
import { recordBug, findMatches } from './bug-memory.js';

describe('bug-memory', () => {
  it('recordBug appends an entry', () => {
    const mem = { entries: [] };
    recordBug(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'wrong sign for locked state', family: 'automation_bug', confidence: 0.76, source: 'scripted_test' });
    expect(mem.entries).toHaveLength(1);
    expect(mem.entries[0].taskId).toBe('T2');
  });

  it('findMatches finds a similar prior bug by title/root-cause overlap', () => {
    const mem = { entries: [] };
    recordBug(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'the chart lock state uses the wrong sign', source: 'scripted_test' });
    const matches = findMatches(mem, { taskId: 'T9', bugTitle: 'Chart lock indicator wrong', rootCause: 'lock state sign appears inverted again' });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].entry.taskId).toBe('T2');
  });

  it('findMatches excludes entries from the same task', () => {
    const mem = { entries: [] };
    recordBug(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'wrong sign for locked state', source: 'scripted_test' });
    const matches = findMatches(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'wrong sign for locked state' });
    expect(matches).toHaveLength(0);
  });

  it('findMatches returns nothing for unrelated bugs', () => {
    const mem = { entries: [] };
    recordBug(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'wrong sign for locked state', source: 'scripted_test' });
    const matches = findMatches(mem, { taskId: 'T9', bugTitle: 'Export toast never appears', rootCause: 'toast component not mounted after export click' });
    expect(matches).toHaveLength(0);
  });

  it('findMatches returns empty when there is no bugTitle or rootCause to probe with', () => {
    const mem = { entries: [] };
    recordBug(mem, { taskId: 'T2', bugTitle: 'Chart lock sign inverted', rootCause: 'wrong sign for locked state', source: 'scripted_test' });
    expect(findMatches(mem, { taskId: 'T9' })).toHaveLength(0);
  });
});
