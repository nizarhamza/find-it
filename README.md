# Find It

A Mastermind-style code breaking game. Guess the hidden **number** or **word** from
colour-coded feedback after each try.

The single-player game is a static, backend-free `index.html` — no build step, no
dependencies. There's also an optional **multiplayer race mode** (below), backed by a
small Cloudflare Worker in [`worker/`](worker/).

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

## Multiplayer (race mode)

Click **🌐 Play online — race a friend** in the menu.

1. Pick a name — you get a permanent, unique player ID on that device. No password.
2. **Create a room** and share the 6-digit code, or **join** with one a friend sent you.
3. The host hits **Start race**. Everyone gets the exact same hidden number/word (drawn
   using whatever Mode/Settings the host had selected) and races to crack it first —
   you see everyone's live attempt count, never their guesses.
4. First exact match wins and reveals the code to the room. The host can start a
   rematch in the same room without handing out a new code.

This needs the small backend in [`worker/`](worker/) (a Cloudflare Worker + Durable
Object — one lightweight, in-memory room per code, no database). See
[DEPLOY.md](DEPLOY.md#multiplayer-backend) to deploy your own.

## Running locally

Open `index.html` in any browser. That's it. (Single-player only — multiplayer needs
the Worker deployed and its URL set in `API_BASE`, see above.)

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
