import { describe, expect, it } from 'vitest';
import { formatDateTime, initials, PRIORITY_TONE, STATUS_ORDER, STATUS_TONE } from '@/lib/status';

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Ada Obi')).toBe('AO');
  });

  it('uppercases single-word names', () => {
    expect(initials('ada')).toBe('A');
  });

  it('caps at two letters for long names', () => {
    expect(initials('Ada Grace Obi')).toBe('AG');
  });

  it('handles empty input without throwing', () => {
    expect(initials('')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('returns an empty string for null/undefined', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
  });

  it('formats a valid ISO date into a human-readable string', () => {
    const result = formatDateTime('2026-07-25T13:22:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('·');
  });

  it('falls back to the raw string for unparseable input', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
  });
});

describe('status/priority tone maps', () => {
  it('covers every request status in STATUS_ORDER', () => {
    STATUS_ORDER.forEach((status) => {
      expect(STATUS_TONE[status]).toBeDefined();
    });
  });

  it('assigns red to High priority and gray to Low', () => {
    expect(PRIORITY_TONE.High).toBe('red');
    expect(PRIORITY_TONE.Low).toBe('gray');
  });
});
