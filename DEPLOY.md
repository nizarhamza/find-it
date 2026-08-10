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

## Custom domain

Pages dashboard → your project → **Custom domains** → *Set up a domain*. If the domain
is already on Cloudflare, DNS is configured for you; otherwise add the CNAME they show
you at your registrar. HTTPS certificates are issued automatically.

---

## Notes

- Free tier covers unlimited requests and 500 builds/month — far beyond what this needs.
- The game runs entirely in the browser: no API keys, no server, no running costs.
- `.gitignore` already excludes OS and editor junk.
