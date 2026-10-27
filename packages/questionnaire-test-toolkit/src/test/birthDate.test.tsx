import { afterEach, describe, expect, test, vi } from 'vitest';
import { getBirthDateForAge } from '@aehrc/questionnaire-test-toolkit';

const originalTz = process.env.TZ;

afterEach(() => {
  vi.useRealTimers();
  process.env.TZ = originalTz;
});

function freezeAt(localIsoDate: string, tz: string) {
  process.env.TZ = tz;
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${localIsoDate}T12:00:00`));
}

describe('getBirthDateForAge', () => {
  test('returns the intended local calendar date in Australia/Sydney', () => {
    freezeAt('2026-03-15', 'Australia/Sydney');
    expect(getBirthDateForAge(1)).toBe('2025-03-15');
  });

  test('returns the intended local calendar date in UTC', () => {
    freezeAt('2026-03-15', 'UTC');
    expect(getBirthDateForAge(1)).toBe('2025-03-15');
  });

  test('does not shift the year near the New Year boundary in a timezone ahead of UTC', () => {
    // 1 January in Australia/Sydney is 31 December in UTC. Converting through toISOString() would
    // have returned the previous year's date.
    freezeAt('2026-01-01', 'Australia/Sydney');
    expect(getBirthDateForAge(0)).toBe('2026-01-01');
  });

  test('does not shift the date just after midnight in a timezone ahead of UTC', () => {
    freezeAt('2026-01-02', 'Australia/Sydney');
    expect(getBirthDateForAge(0)).toBe('2026-01-02');
  });

  test('rolls 29 February over to 1 March in a non-leap target year', () => {
    // Today is 29 February 2028 (leap year); the target year 2027 is not a leap year, so the Date
    // constructor rolls the birthday over to 1 March. Documented behavior; clinical leap-day
    // policies should use explicit DOB fixtures.
    freezeAt('2028-02-29', 'Australia/Sydney');
    expect(getBirthDateForAge(1)).toBe('2027-03-01');
  });

  test('keeps 29 February when the target year is a leap year', () => {
    freezeAt('2028-02-29', 'UTC');
    expect(getBirthDateForAge(4)).toBe('2024-02-29');
  });

  test('formats single-digit months and days with leading zeros', () => {
    freezeAt('2026-01-05', 'UTC');
    expect(getBirthDateForAge(0)).toBe('2026-01-05');
  });
});
