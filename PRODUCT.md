# Product

## Register

product

## Users

Casual players who want a quick, replayable Mastermind-style guessing game — solo, or
racing a friend in real time via the multiplayer mode. They play in numbers (English,
French, or Arabic (RTL)) or words (English only — no built-in list, so a secret and every
guess are checked live against a dictionary API), on desktop or mobile, light or dark
theme, and can install the game as a PWA. Sessions are short: pick a mode/settings, play
a round or two, maybe start a rematch.

## Product Purpose

A lightweight, backend-free single-player code-breaking game (guess a hidden number or
word from color-coded feedback), plus an optional real-time multiplayer race mode
backed by a small Cloudflare Worker. Success looks like: instantly understandable,
satisfying to replay back-to-back, and feels like picking up a fun little puzzle toy —
not filling out a settings form.

## Brand Personality

Playful, tactile, uncluttered. It should read as a game — colour-coded pegs, confetti
on a win, a gradient wordmark — not as an admin panel that happens to have a game
attached. Settings exist to get out of the way quickly so the player can start guessing.

## Anti-references

The generic SaaS settings panel: dense rows of identical outline buttons and plain
`<select>`s with no visual hierarchy between "configure" and "go." That's explicitly
the feeling the current settings card gives today and the thing to move away from.

## Design Principles

- **Primary actions look primary.** Starting/ending a round ("New game") should
  outrank passive configuration (language, length, difficulty) at a glance.
- **Settings recede, play advances.** Configuration controls read lighter/quieter;
  the controls that move you into a round read heavier.
- **Speak the app's existing playful language.** Reuse the vocabulary already
  established elsewhere (colour-coded pegs, gradient wordmark, confetti) rather than
  inventing a new visual system for one card.
- **Personality never costs scanability.** Still fast to read and operate one-handed
  on mobile, and just as fast on desktop.
- **Respect existing theming.** Full light/dark parity, WCAG AA contrast in both,
  right-to-left layout for Arabic, and a reduced-motion fallback for anything animated.

## Accessibility & Inclusion

WCAG AA contrast in both light and dark themes (already the case per the README).
RTL layout support for Arabic. Any new motion needs a
`@media (prefers-reduced-motion: reduce)` fallback, matching the pattern already used
for the settings-panel collapse animation.
