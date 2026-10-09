# usage-meter

A Claude Code mod that shows your usage limits in a small docked pane: the
5-hour session window and the weekly limit, each as a coloured bar (green,
yellow from 70%, red from 90%) with the time it resets.

```
Session Usage                 42%
5-hour rolling window
████████░░░░░░░░░░░░
Resets Today 6:50PM

All models                    18%
Weekly
████░░░░░░░░░░░░░░░░
Resets Oct 14, 4:00AM
```

## Install

Type this at the prompt of a Claude Code session in a terminal:

```
/plugin install usage-meter --marketplace rodrigocamargo/usage-meter
```

Answer `y` to add the marketplace, then press Enter to install for your user.

## Use

- The pane opens by itself when a session starts in a terminal at least
  144 columns wide.
- In a narrower window, type `/usage-meter` to open it.
- The numbers appear after the first reply, on a Claude subscription plan
  (API-key sessions have no usage limits to show).

## Develop

```
claude plugin validate .
claude plugin test .
claude --plugin-dir .
```

## License

MIT
