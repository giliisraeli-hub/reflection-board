# Reflection Board — Phase 1 Rebrand Retro

A real, shareable team retro board (Wins / Learnings / Improvements / Questions,
each with topic sub-sections: Emails, Website, App, QA flow, Meetings structure,
Communication channels, General).

This gets you a **real public URL** your team can open in any browser — no Claude,
no download, no install required for them. Setup below is done entirely through
websites in your browser — no terminal needed.

## Step 1 — Put the code on GitHub (5 min)

1. Go to https://github.com and create a free account if you don't have one.
2. Click the **+** in the top right → **New repository**.
3. Name it `reflection-board`, keep it Public or Private (either works), click **Create repository**.
4. On the new repo's page, click **uploading an existing file** (a link in the quick-setup text).
5. Drag this entire project folder's contents into the upload box (all the files and folders — `app/`, `package.json`, `next.config.js`, this `README.md`).
6. Scroll down, click **Commit changes**.

## Step 2 — Deploy it on Vercel (5 min)

1. Go to https://vercel.com and sign up — choose **Continue with GitHub** so the two are linked automatically.
2. Click **Add New → Project**.
3. Find your `reflection-board` repo in the list and click **Import**.
4. Leave all settings as default (Vercel auto-detects Next.js) and click **Deploy**.
5. Wait ~1 minute. You'll get a live URL like `https://reflection-board-yourname.vercel.app` — that's your shareable link.

At this point the site is live, but adding cards will show an error — that's expected, because it needs a database next.

## Step 3 — Add free storage (5 min)

1. In your Vercel project dashboard, click the **Storage** tab.
2. Click **Create Database** → choose **KV** (this is Vercel's free key-value store, exactly what this app uses).
3. Follow the prompts to create it and **connect it to your project** (Vercel does this automatically and adds the right environment variables for you — you don't need to copy/paste any keys).
4. Go to the **Deployments** tab and click **Redeploy** on the latest deployment, so it picks up the new database connection.

## Step 4 — Share it

Send your team the URL from Step 2 (e.g. `https://reflection-board-yourname.vercel.app`).
Everyone who enters the same **board code** on the entry screen sees and edits the same board.

## Updating the design or copy later

If you (or I) want to change anything later, edit the files and re-upload them to GitHub
(GitHub's web UI lets you edit files directly and commit — no re-download needed). Vercel
automatically redeploys within about a minute of any change.

## What this uses

- Next.js (App Router) for the site and its tiny API
- Vercel KV (free tier) to store board data so it persists and syncs between teammates
- Board data model: `meta:{code}` (title/date/reveal state) and `cards:{code}` (all cards) — same structure as the prototype we built in Claude
