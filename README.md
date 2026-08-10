# Find It

A Mastermind-style code breaking game. Guess the hidden **number** or **word** from
colour-coded feedback after each try.

No build step, no dependencies, no backend — the whole game is a single `index.html`.

## How to play

A secret code is generated and hidden. After each guess you get three counters:

| Colour | Meaning |
| --- | --- |
| 🟢 green | right digit/letter, **in the right place** |
| 🟡 amber | right digit/letter, **wrong place** |
| 🔴 red | not in the code at all |

Narrow it down before you run out of tries.

- **Numbers mode** — 3 to 6 digits, repeats allowed (so `1223` is possible).
- **Words mode** — 3 to 8 letters, secret drawn from a built-in list; guesses must be
  real words from that list.
- **Difficulty** — Easy (15 tries), Normal (10), Hard (7).

Feedback uses standard Mastermind counting, so totals never exceed the real number of
occurrences: guessing `2222` against `1223` scores 2 green and 0 amber, not 3.

### Controls

- Type to auto-advance between boxes
- **Backspace** to step back
- **Enter** to check your guess, and again after a round to start the next one
- **Esc** to dismiss the results and study the board
- ☾ / ☀ in the corner switches light and dark mode (follows your OS by default)

## Running locally

Open `index.html` in any browser. That's it.

## Deploying

It's a static file, so any static host works. See [DEPLOY.md](DEPLOY.md) for
step-by-step instructions.

**Cloudflare Pages** (connected to this repo):

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |

Every push to `main` redeploys automatically.

## Browser support

Any modern browser. Confetti degrades to nothing if `<canvas>` is unavailable, and all
colours meet WCAG AA contrast in both themes.
