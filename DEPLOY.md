# Putting Find It online

The game is one self-contained HTML file — no build step, no server, no dependencies.
The folder `find-it-site/` is ready to publish as-is (the file is renamed `index.html`
so it loads at the root of your URL).

---

## Option 1 — Netlify Drop (fastest, ~30 seconds)

1. Go to **https://app.netlify.com/drop**
2. Drag the whole **`find-it-site`** folder onto the page (the folder, not the file).
3. It uploads and gives you a live URL like `https://random-name-123.netlify.app`.
4. Sign in (GitHub/email) when prompted to keep the site permanently — without an
   account the URL expires after about an hour.
5. Rename it under **Site configuration → Change site name** to get
   `https://your-name.netlify.app`.

To update later: open the site → **Deploys** tab → drag the folder in again.

---

## Option 2 — Cloudflare Pages

1. Go to **https://pages.cloudflare.com** → *Create a project* → *Direct Upload*.
2. Drag the `find-it-site` folder in.
3. Free, fast global CDN, and the URL never expires.

---

## Option 3 — GitHub Pages (best if you want version history)

```bash
cd find-it-site
git init
git add index.html
git commit -m "Find It game"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/find-it.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: main branch / root**.
Live a minute later at `https://YOUR-USERNAME.github.io/find-it/`.

---

## Option 4 — Vercel

1. **https://vercel.com/new** → import the repo, or run `npx vercel` inside `find-it-site`.
2. Framework preset: **Other**. No build command, output directory `.`.

---

## Notes

- Every host above has a free tier that covers a static page like this comfortably.
- HTTPS is automatic on all of them.
- The game runs entirely in the browser, so there is nothing to secure, no API keys,
  and no running costs.
- Want a custom domain? All four let you point one at the site from their dashboard —
  you add a CNAME record at your registrar.
- If you edit `find-it.html`, copy it over `find-it-site/index.html` before redeploying.
