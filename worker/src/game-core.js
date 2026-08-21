// Shared game core — Mastermind-style scoring + secret generation, used by the multiplayer
// Durable Object (worker/src/room.js) to generate room secrets and score guesses server-side.
// No built-in word list: word secrets are drawn live from Datamuse, mirroring the client-side
// pool in ../../index.html (see WORD_MODE_LANG there — English only, no reliable free
// dictionary API for fr/ar).

const WORD_REGEX = /^[a-z]+$/; // only plain a–z entries count — Datamuse's corpus includes phrases, hyphenations, etc.

// A word made of one letter repeated ("aaaa", "bbbb", "mmmm", ...) is essentially never a
// real English word — Datamuse's "spelled like" wildcard surfaces these anyway via
// coincidental initialism entries (e.g. "aaaa" = "Amateur Athletic Association of America",
// "cccc" = a string of unrelated colleges' initials) or elongated-spelling entries (e.g.
// "mmmm" = "Elongated form of mmm"), none of which are genuine vocabulary. Mirrors index.html.
const REPEATED_CHAR_REGEX = /^(.)\1*$/;

// Wiktionary's own phrasing for dialectal/eye-dialect respellings of another word (e.g.
// "dat" defs as "...Pronunciation spelling of that."), consistent enough across entries
// to match on the text directly — Datamuse exposes no dedicated flag for this.
const PRON_SPELLING_REGEX = /\b(?:pronunciation spelling|eye dialect spelling|nonstandard spelling) of\b/i;

// Datamuse's md=d defs are "<tag>\t<text>" where <tag> is the entry's Wiktionary part of
// speech (n, v, adj, ...). A slice of entries — almost always a mismatched/punctuated page
// title (e.g. "Grrr!" for a lowercase "grrr" query) — come back with an UPPERCASE tag
// instead (e.g. "N") and their "definitions" are encyclopedia/trivia blurbs (ad campaigns,
// albums, films), not real senses of the word. No dedicated Datamuse flag for this, so
// detect it by shape, same approach as PRON_SPELLING_REGEX above. Mirrors index.html.
const UPPERCASE_TAG_REGEX = /^[A-Z]+\t/;

// Wiktionary groups related senses under a shared lead-in line ending in a colon (e.g. "Of a
// person or an animal:" followed by indented sub-senses like "Well-behaved..."). Datamuse
// flattens the whole page, so these lead-ins come back as standalone "defs" even though
// they're not complete definitions on their own. Mirrors index.html.
function isUsableDef(d){
  if (UPPERCASE_TAG_REGEX.test(d)) return false;
  const text = (d.includes("\t") ? d.split("\t")[1] : d).trim();
  return !!text && !/:\s*$/.test(text);
}
const LEVELS = ["easy", "medium", "hard", "hell"]; // most-common quarter of the pool -> rarest quarter

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
// Each cached entry is enriched, not a bare word: { word, freq, prop, defs }. freq is
// Datamuse's per-million-word corpus frequency (md=f) — the commonness signal levels are
// bucketed on. prop marks proper nouns (md=p tags a word "prop"). Both filtering by
// real-words-only and slicing by level happen client-side, in memory, over this one
// cached pool per length — no extra Datamuse requests or extra cache keys needed.
const wordPoolCache = new Map();

async function fetchWordPool(len){
  const pattern = encodeURIComponent("?".repeat(len)); // Datamuse "spelled like": ? = any one letter
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${pattern}&max=1000&md=dfp`, { signal: controller.signal });
    if (!res.ok) return [];
    const hits = await res.json();
    // a hit only counts if it's exactly the right length, spelled with plain a–z letters,
    // and carries at least one definition (Datamuse's corpus includes junk near-matches
    // that aren't real words)
    const byWord = new Map();
    for (const h of hits){
      if (h.word.length !== len || !WORD_REGEX.test(h.word)) continue;
      if (REPEATED_CHAR_REGEX.test(h.word)) continue;
      if (!Array.isArray(h.defs) || !h.defs.length) continue;
      if (byWord.has(h.word)) continue;
      const tags = Array.isArray(h.tags) ? h.tags : [];
      const freqTag = tags.find(tag => tag.startsWith("f:"));
      byWord.set(h.word, {
        word: h.word,
        freq: freqTag ? parseFloat(freqTag.slice(2)) || 0 : 0,
        prop: tags.includes("prop"),
        defs: h.defs,
      });
    }
    return [...byWord.values()];
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

function isRealWordEntry(entry){
  return !entry.prop
    && entry.defs.some(isUsableDef)
    && !entry.defs.some(d => PRON_SPELLING_REGEX.test(d));
}

// Slices a freq-sorted pool into quarters: easy = commonest quarter, hell = rarest.
function quartileSlice(sorted, level){
  const idx = Math.max(0, LEVELS.indexOf(level));
  const n = sorted.length;
  const start = Math.floor(n * idx / 4);
  const end = Math.floor(n * (idx + 1) / 4);
  return sorted.slice(start, end);
}

// Narrows an enriched pool down to the requested level + real-words-only setting, always
// falling back to a wider slice rather than ever returning empty: a level's quarter can
// come up thin (or empty) at sparse lengths, especially combined with real-words-only, so
// this tries the quarter, then the whole filtered pool, then the whole unfiltered pool.
function pickLevelPool(entries, level, realWordsOnly){
  const filtered = realWordsOnly ? entries.filter(isRealWordEntry) : entries;
  const base = filtered.length ? filtered : entries;
  const sorted = [...base].sort((a, b) => b.freq - a.freq);
  const bucket = quartileSlice(sorted, level);
  return (bucket.length ? bucket : sorted).map(e => e.word);
}

// Returns the secret, or null if word mode couldn't get a dictionary word (caller must
// handle this — there's no built-in list to fall back to).
export async function randomSecret(mode, len, lang, level = "medium", realWordsOnly = false){
  if (mode === "num"){
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  }
  const entries = await getWordPool(len); // word mode is English-only — lang is accepted for API symmetry with the client but not otherwise used
  const pool = pickLevelPool(entries, level, realWordsOnly);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
