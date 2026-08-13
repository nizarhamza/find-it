// Shared game core — Mastermind-style scoring + secret generation, used by the multiplayer
// Durable Object (worker/src/room.js) to generate room secrets and score guesses server-side.
// No built-in word list: word secrets are drawn live from Datamuse, mirroring the client-side
// pool in ../../index.html (see WORD_MODE_LANG there — English only, no reliable free
// dictionary API for fr/ar).

const WORD_REGEX = /^[a-z]+$/; // only plain a–z entries count — Datamuse's corpus includes phrases, hyphenations, etc.

/* ---------------- Core scoring (Mastermind rules) ---------------- */
export function score(secret, guess){
  const n = secret.length;
  let exact = 0;
  const sc = Object.create(null), gc = Object.create(null);
  for (let i = 0; i < n; i++){
    if (secret[i] === guess[i]) { exact++; continue; }
    sc[secret[i]] = (sc[secret[i]] || 0) + 1;
    gc[guess[i]]  = (gc[guess[i]]  || 0) + 1;
  }
  let partial = 0;
  for (const ch in gc) if (sc[ch]) partial += Math.min(sc[ch], gc[ch]);
  return { exact, partial, wrong: n - exact - partial };
}

/* ---------------- Secret generation ---------------- */
// Real dictionary words fetched from Datamuse, cached per "lang:len" for as long as this
// Durable Object instance stays warm — only the first word-mode secret of a given length in
// a room pays the network round trip; every later one in that same room is instant. Only a
// *successful* (non-empty) fetch is cached — an offline blip or API hiccup isn't remembered,
// so the next call just retries instead of getting stuck failing forever.
const wordPoolCache = new Map();

async function fetchWordPool(len){
  const pattern = encodeURIComponent("?".repeat(len)); // Datamuse "spelled like": ? = any one letter
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${pattern}&max=1000&md=d`, { signal: controller.signal });
    if (!res.ok) return [];
    const hits = await res.json();
    // a hit only counts if it's exactly the right length, spelled with plain a–z letters,
    // and carries at least one definition (Datamuse's corpus includes junk near-matches
    // that aren't real words)
    return [...new Set(hits
      .filter(h => h.word.length === len && WORD_REGEX.test(h.word) && Array.isArray(h.defs) && h.defs.length > 0)
      .map(h => h.word))];
  } catch {
    return []; // offline / timed out / API hiccup
  } finally {
    clearTimeout(timer);
  }
}

async function getWordPool(len){
  const cached = wordPoolCache.get(len);
  if (cached && cached.length) return cached;
  const pool = await fetchWordPool(len);
  if (pool.length) wordPoolCache.set(len, pool);
  return pool;
}

// Returns the secret, or null if word mode couldn't get a dictionary word (caller must
// handle this — there's no built-in list to fall back to).
export async function randomSecret(mode, len, lang){
  if (mode === "num"){
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  }
  const pool = await getWordPool(len); // word mode is English-only — lang is accepted for API symmetry with the client but not otherwise used
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
