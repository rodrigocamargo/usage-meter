import { describe, expect, test } from 'claude-code/testing'

import { bar, resetText } from '../hooks/register'

describe('usage-meter', () => {
  test('a bar fills to the percent used and keeps its width', async () => {
    expect(bar(7, 20)).toEqual({ filled: '█'.repeat(1), empty: '░'.repeat(19) })
    expect(bar(100, 10).filled).toBe('█'.repeat(10))
    expect(bar(150, 10).empty).toBe('')
  })

  test('reset time reads "Today" on the same day, a date otherwise', async () => {
    const now = new Date(2026, 9, 2, 14, 0).getTime()
    expect(resetText(new Date(2026, 9, 2, 18, 50).toISOString(), now)).toBe('Resets Today 6:50PM')
    expect(resetText(new Date(2026, 9, 9, 4, 0).toISOString(), now)).toBe('Resets Oct 9, 4:00AM')
    expect(resetText(undefined, now)).toBe('')
  })
})
