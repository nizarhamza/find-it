// Worker entry point — handles the two plain-HTTP routes (create a room, list nothing else)
// and forwards WebSocket upgrades straight through to the room's Durable Object.
// Deploy with `wrangler deploy` from inside worker/, then paste the resulting
// *.workers.dev URL into API_BASE near the top of index.html's multiplayer script.
import { Room } from "./room.js";
export { Room };

// Tighten this to your Pages URL once deployed, e.g. "https://find-it.pages.dev" —
// left open for local `wrangler dev` testing against file:// / any preview URL.
const ALLOWED_ORIGIN = "*";

function withCORS(resp) {
  const h = new Headers(resp.headers);
  h.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  h.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  h.set("Access-Control-Allow-Headers", "Content-Type");
  return new Response(resp.body, { status: resp.status, headers: h });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}

// Plain 6-digit numeric code, e.g. "042817" — leading zeros allowed, always 6 chars.
function makeCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") return withCORS(new Response(null, { status: 204 }));

    if (url.pathname === "/api/rooms" && request.method === "POST") {
      let body;
      try { body = await request.json(); } catch { return withCORS(json({ error: "bad json" }, 400)); }
      const { mode, len, lang, hostId, hostName } = body || {};
      if (!hostId || !hostName || (mode !== "num" && mode !== "word") || !len) {
        return withCORS(json({ error: "missing or invalid fields" }, 400));
      }

      // Try a handful of random codes; a 409 only happens if that exact 6-digit code
      // already has a live room, which is rare across a ~1M-code space.
      for (let attempt = 0; attempt < 6; attempt++) {
        const code = makeCode();
        const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
        const res = await stub.fetch("https://room/reserve", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, mode, len: Number(len), lang, hostId, hostName }),
        });
        if (res.ok) return withCORS(json({ code }));
      }
      return withCORS(json({ error: "could not allocate a room code, try again" }, 503));
    }

    const m = url.pathname.match(/^\/api\/rooms\/(\d{6})\/socket$/);
    if (m) {
      const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1]));
      return stub.fetch(request); // 101 upgrade response passes straight through
    }

    return withCORS(json({ error: "not found" }, 404));
  },
};
