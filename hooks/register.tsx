import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit } from '../types'

const PANE = 'usage-meter'
const limits = atom({ plugin: 'usage-meter', key: 'limits' } as const, [])

const LABELS: Record<string, { title: string; sub: string }> = {
  five_hour: { title: 'Session Usage', sub: '5-hour rolling window' },
  seven_day: { title: 'All models', sub: 'Weekly' },
}

/** "Today 6:50PM" or "Oct 9, 4:00AM", in local time. */
export function resetText(iso: string | undefined, now: number): string {
  if (iso === undefined) return ''
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  const time = at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '')
  const today = new Date(now).toDateString() === at.toDateString()
  const day = today ? 'Today' : at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ','
  return `Resets ${day} ${time}`
}

/** A bar `width` cells wide, filled to `percent`. */
export function bar(percent: number, width: number): { filled: string; empty: string } {
  const cells = Math.max(4, width)
  const n = Math.round((Math.min(100, Math.max(0, percent)) / 100) * cells)
  return { filled: '█'.repeat(n), empty: '░'.repeat(cells - n) }
}

const colorFor = (percent: number) => (percent >= 90 ? 'red' : percent >= 70 ? 'yellow' : 'green')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'usage-meter', description: 'Show the usage-limit pane' })
    const usage = await $.session.usage()
    await update($, limits, () => usage.rateLimits)
    void $.ui.open({ id: PANE, title: 'Usage' })
    return next(e)
  })

  on('command.run', { command: 'usage-meter' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Usage' })
    return { text: 'Usage pane opened.' }
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('rateLimits')) await update($, limits, () => e.rateLimits)
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const list: Limit[] = await read($, limits)
    // The engine draws the pane's close mark over the top-right cell, so keep the
    // right edge clear (it covered the first row's "%").
    const width = Math.max(10, e.props.bodyColumns - 3)
    const now = await $.clock.now()
    if (list.length === 0) {
      return <Text dimColor>No usage reading yet (shown after the first reply, on a subscription).</Text>
    }
    return (
      <Box flexDirection="column" paddingRight={3}>
        {list.map(limit => {
          const label = LABELS[limit.kind] ?? { title: limit.kind, sub: '' }
          const { filled, empty } = bar(limit.percentUsed, width)
          return (
            <Box flexDirection="column" marginBottom={1}>
              <Box flexDirection="row" justifyContent="space-between">
                <Text bold>{label.title}</Text>
                <Text bold color={colorFor(limit.percentUsed)}>{`${limit.percentUsed}%`}</Text>
              </Box>
              {label.sub !== '' && <Text dimColor>{label.sub}</Text>}
              <Text>
                <Text color={colorFor(limit.percentUsed)}>{filled}</Text>
                <Text dimColor>{empty}</Text>
              </Text>
              <Text dimColor>{resetText(limit.resetsAt, now)}</Text>
            </Box>
          )
        })}
      </Box>
    )
  })
}
