# Deploying Find It

The site is one static file (`index.html`). Nothing to build, nothing to install.

---

## Step 1 — Put the repo on GitHub

This folder is already a git repository with one commit on `main`.

1. Create an **empty** repo at https://github.com/new
   - Name: `find-it`
   - **Do not** tick "Add a README" / .gitignore / license — the repo already has them,
     and an initialised remote will cause a push conflict.
2. Push from inside this folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/find-it.git
git push -u origin main
```

If git asks for a password, use a **personal access token** (GitHub no longer accepts
account passwords): https://github.com/settings/tokens → *Generate new token (classic)*
→ tick `repo` → paste it as the password.

---

## Step 2 — Connect it to Cloudflare Pages

1. https://pages.cloudflare.com → **Ship something new** → **Connect GitHub**
2. Authorise Cloudflare and pick the `find-it` repository.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | **None** |
   | Build command | *(leave empty)* |
   | Build output directory | `/` |

4. **Save and Deploy.** First build takes under a minute.
5. Live at `https://find-it.pages.dev` (or `find-it-xyz.pages.dev` if the name is taken).

From then on, every `git push` to `main` triggers an automatic redeploy. Pull requests
get their own preview URL.

---

## Updating the game

```bash
# edit index.html, then:
git add index.html
git commit -m "Describe the change"
git push
```

Cloudflare picks it up within a minute. Roll back any time from the Pages dashboard →
**Deployments** → pick an older build → *Rollback*.

---

## Skipping git entirely

If you'd rather not use a repo, Cloudflare Pages also accepts a straight upload:
**Ship something new → Upload your static files**, then drag this folder in. You lose
automatic redeploys and version history, but it works in about ten seconds.

---

## Multiplayer backend

The race mode (create/join a room, live guessing) needs the Worker in
[`worker/`](worker/) deployed separately from the static site. It's a normal Cloudflare
Worker — no database, just one Durable Object per room code.

1. **Install Wrangler and log in** (once):

   ```bash
   cd worker
   npm install
   npx wrangler login
   ```

2. **Deploy it:**

   ```bash
   npx wrangler deploy
   ```

   Wrangler prints a URL like `https://find-it-api.<your-subdomain>.workers.dev` —
   that's your `API_BASE`.

3. **Point the frontend at it.** Open `index.html`, find this line near the end of the
   `<script>` block (search for `API_BASE`):

   ```js
   const API_BASE = "https://find-it-api.YOUR-SUBDOMAIN.workers.dev";
   ```

   Replace it with the URL from step 2, then commit and push (or re-upload) so the
   deployed static site picks it up.

4. **(Optional, recommended) lock down CORS.** By default the Worker accepts requests
   from any origin (`ALLOWED_ORIGIN = "*"` in `worker/src/index.js`) so it's easy to
   test locally. Once you know your Pages URL, set it there instead:

   ```js
   const ALLOWED_ORIGIN = "https://find-it.pages.dev";
   ```

   and redeploy the Worker (`npx wrangler deploy`).

### Local testing

```bash
cd worker
npm run dev        # starts the Worker on http://localhost:8787
```

Point `API_BASE` in `index.html` at `http://localhost:8787` while testing, then switch
it back to your deployed URL before shipping.

### How it works

- Rooms don't live in a database — a room code (e.g. `042817`) deterministically maps
  to one Durable Object instance (`env.ROOMS.idFromName(code)`), which holds that
  room's secret, players, and live WebSocket connections in memory + its own storage.
- Player identity is just a `crypto.randomUUID()` generated in the browser on first
  sign-up and kept in `localStorage` — no accounts, no passwords, nothing server-side
  to manage.
- An abandoned room's Durable Object storage self-deletes ~2 hours after creation via
  a Durable Object alarm, so nothing needs manual cleanup.
- Costs: Workers + Durable Objects free tier comfortably covers casual/small-group use.

## Custom domain

Pages dashboard → your project → **Custom domains** → *Set up a domain*. If the domain
is already on Cloudflare, DNS is configured for you; otherwise add the CNAME they show
you at your registrar. HTTPS certificates are issued automatically.

---

## Notes

- Free tier covers unlimited requests and 500 builds/month — far beyond what this needs.
- The game runs entirely in the browser: no API keys, no server, no running costs.
- `.gitignore` already excludes OS and editor junk.
