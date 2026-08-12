// Durable Object — one instance per 6-digit room code (see index.js: `env.ROOMS.idFromName(code)`).
// Holds the room's secret (never sent to clients until the round ends), the player list,
// and every live WebSocket connection for that room. Uses the WebSocket Hibernation API so
// the object can be evicted between messages without dropping connections.
import { score, randomSecret } from "./game-core.js";

const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // auto-wipe an abandoned room's storage after 2h

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/reserve") && request.method === "POST") return this.handleReserve(request);
    if (url.pathname.endsWith("/socket")) return this.handleSocket(request);
    return new Response("Not found", { status: 404 });
  }

  // Called once by the Worker when a player asks to create a room. Fails (409) if this
  // room code already has a live or unfinished game — the Worker retries with a new code.
  async handleReserve(request) {
    const existing = await this.state.storage.get("room");
    if (existing && existing.status !== "finished") return json({ error: "taken" }, 409);

    const body = await request.json();
    const { code, mode, len, lang, hostId, hostName } = body;
    if (!code || !mode || !len || !hostId || !hostName) return json({ error: "missing fields" }, 400);

    const room = {
      code,
      mode,
      len: Number(len),
      lang: lang || "en",
      secret: await randomSecret(mode, Number(len), lang || "en"),
      status: "waiting", // waiting -> playing -> finished
      hostId,
      winnerId: null,
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      players: {
        [hostId]: { id: hostId, nickname: String(hostName).slice(0, 24), attempts: 0, solved: false, gaveUp: false, wins: 0, finishedAt: null, rank: null },
      },
    };
    await this.state.storage.put("room", room);
    await this.state.storage.setAlarm(Date.now() + ROOM_TTL_MS);
    return json({ ok: true });
  }

  // Joining a room IS opening this socket — there's no separate "join" call. The DO adds
  // the player (if new) before accepting, then broadcasts the fresh player list to everyone.
  async handleSocket(request) {
    const url = new URL(request.url);
    const playerId = url.searchParams.get("playerId");
    const nickname = (url.searchParams.get("nickname") || "Player").slice(0, 24);
    if (!playerId) return new Response("Missing playerId", { status: 400 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected websocket", { status: 426 });

    const room = await this.state.storage.get("room");
    if (!room) return new Response("Room not found", { status: 404 });

    const isNewPlayer = !room.players[playerId];
    if (isNewPlayer && room.status !== "waiting") {
      return new Response("Game already in progress", { status: 409 });
    }

    if (isNewPlayer) {
      room.players[playerId] = { id: playerId, nickname, attempts: 0, solved: false, gaveUp: false, wins: 0, finishedAt: null, rank: null };
    } else {
      room.players[playerId].nickname = nickname; // allow a rename to stick on reconnect
    }
    await this.state.storage.put("room", room);

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server, [playerId]); // tag the socket with its player id for later lookup

    await this.broadcastState();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    const room = await this.state.storage.get("room");
    if (!room) return;
    const [playerId] = this.state.getTags(ws);

    let data;
    try { data = JSON.parse(message); } catch { return; }

    if (data.type === "start" && playerId === room.hostId && room.status === "waiting") {
      room.status = "playing";
      room.startedAt = Date.now();
      await this.state.storage.put("room", room);
      return this.broadcastState();
    }

    if (data.type === "rematch" && playerId === room.hostId && room.status === "finished") {
      room.secret = await randomSecret(room.mode, room.len, room.lang);
      room.status = "waiting";
      room.winnerId = null;
      room.startedAt = null;
      room.finishedAt = null;
      for (const p of Object.values(room.players)) {
        // wins carries over — it's the room's running score across rounds, not this round's state
        p.attempts = 0; p.solved = false; p.gaveUp = false; p.finishedAt = null; p.rank = null;
      }
      await this.state.storage.put("room", room);
      return this.broadcastState();
    }

    // Conceding stops that player's guessing but doesn't reveal the secret early — the
    // round still ends the normal way (someone solves it) unless this was the last player
    // still actively racing, in which case there's no one left to win it.
    if (data.type === "giveup" && room.status === "playing") {
      const player = room.players[playerId];
      if (!player || player.solved || player.gaveUp) return;
      player.gaveUp = true;
      const stillRacing = Object.values(room.players).some(p => !p.solved && !p.gaveUp);
      if (!stillRacing && !room.winnerId) {
        room.status = "finished";
        room.finishedAt = Date.now();
      }
      await this.state.storage.put("room", room);
      return this.broadcastState();
    }

    if (data.type === "guess" && room.status === "playing") {
      const player = room.players[playerId];
      if (!player || player.solved || player.gaveUp) return;
      const guess = String(data.value || "").toLowerCase();
      if (guess.length !== room.len) return;

      const result = score(room.secret, guess);
      player.attempts++;
      ws.send(JSON.stringify({ type: "result", guess, result }));

      if (result.exact === room.len) {
        player.solved = true;
        player.finishedAt = Date.now();
        player.rank = Object.values(room.players).filter(p => p.solved).length;
        if (!room.winnerId) {
          room.winnerId = playerId;
          room.status = "finished";
          room.finishedAt = Date.now();
          player.wins = (player.wins || 0) + 1;
        }
      }
      await this.state.storage.put("room", room);
      return this.broadcastState();
    }

    if (data.type === "leave") {
      const wasHost = playerId === room.hostId;
      delete room.players[playerId];
      if (wasHost) {
        // Object key order follows insertion order for these ids, so this hands the role
        // to whoever's been in the room longest — an empty room just ends up host-less.
        room.hostId = Object.keys(room.players)[0] || null;
      }
      await this.state.storage.put("room", room);
      await this.broadcastState();
      ws.close(1000, "left");
    }
  }

  async webSocketClose(ws) {
    // Players are kept in the room on disconnect (e.g. a refresh) so they can rejoin with
    // the same id; only an explicit {type:'leave'} removes them. Nothing to do here but
    // let the socket go — broadcastState() only ever targets currently-open sockets.
  }

  async webSocketError() {}

  async broadcastState() {
    const room = await this.state.storage.get("room");
    if (!room) return;
    const payload = JSON.stringify({
      type: "state",
      status: room.status,
      mode: room.mode,
      len: room.len,
      lang: room.lang,
      hostId: room.hostId,
      winnerId: room.winnerId,
      secret: room.status === "finished" ? room.secret : undefined,
      players: Object.values(room.players)
        .sort((a, b) => (a.rank || 99) - (b.rank || 99))
        .map(p => ({ id: p.id, nickname: p.nickname, attempts: p.attempts, solved: p.solved, gaveUp: p.gaveUp, wins: p.wins || 0, rank: p.rank })),
    });
    for (const ws of this.state.getWebSockets()) {
      try { ws.send(payload); } catch { /* socket gone — it'll drop off on next broadcast */ }
    }
  }

  async alarm() {
    await this.state.storage.deleteAll();
  }
}
