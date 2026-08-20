import { describe, it, expect } from 'vitest';
import { parseRunEnd } from './kane.js';

describe('parseRunEnd', () => {
  it('extracts the terminal run_end event from NDJSON stdout', () => {
    const stdout = [
      '{"step":1,"status":"running","remark":"clicking add"}',
      '{"step":2,"status":"running","remark":"checking badge"}',
      '{"type":"run_end","status":"pass","summary":"Priority badge shown","reason":null,"duration":4.2,"credits":1,"final_state":"passed","test_url":"https://kane.example/t/1"}'
    ].join('\n');
    const result = parseRunEnd(stdout);
    expect(result.status).toBe('pass');
    expect(result.summary).toBe('Priority badge shown');
  });

  it('returns null when no run_end line is present', () => {
    expect(parseRunEnd('{"step":1,"status":"running"}')).toBeNull();
  });
});
