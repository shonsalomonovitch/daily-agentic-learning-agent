# Daily Agentic Learning Agent

A NestJS app that reads agentic design pattern chapters (PDF), generates a deep bilingual (English + Hebrew) explanation using Claude, and emails it to you daily.

---

## Setup

### 1. Copy and fill the `.env` file

```bash
cp .env.example .env
```

Edit `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
MAX_TOKENS=16000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=recipient@example.com

DAILY_CRON=0 9 * * *
```

### 2. Gmail App Password

Gmail requires an **App Password** when using SMTP with 2FA enabled:

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Create a new app password — name it anything
3. Copy the 16-character password into `EMAIL_PASS`

---

## Run locally

```bash
npm install

# Development (watch mode — runs HTTP server with cron)
npm run start:dev

# Send the next chapter now (CLI — no HTTP server)
npm run send-next
```

---

## API Endpoints (when running start:dev)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/chapters` | List all chapters |
| `POST` | `/chapters/send/:chapterNumber` | Send a specific chapter |
| `POST` | `/chapters/send-next` | Send next chapter in progress |
| `POST` | `/chapters/reset-progress` | Reset progress to chapter 1 |

```bash
curl -X POST http://localhost:3000/chapters/send/1
curl -X POST http://localhost:3000/chapters/reset-progress
```

---

## GitHub Actions — Run Automatically Every Day

The workflow at `.github/workflows/daily-agentic-email.yml` runs at **09:00 Israel time** daily, sends the next chapter, and commits the updated `data/progress.json` back to the repo.

### Step 1 — Push the repo to GitHub

Make sure `data/progress.json` is committed and pushed:

```bash
git add data/progress.json
git commit -m "init progress tracking"
git push
```

### Step 2 — Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

Add each of these:

| Secret name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |
| `EMAIL_TO` | Recipient email address |

### Step 3 — Test it manually

Go to your repo → **Actions → Daily Agentic Learning Email → Run workflow**

This lets you trigger it instantly without waiting for the 09:00 schedule.

### How the cron timing works

The workflow uses `0 6 * * *` (06:00 UTC):

| Season | Israel time | UTC |
|---|---|---|
| Summer (Apr–Oct, UTC+3) | 09:00 IDT | 06:00 UTC |
| Winter (Nov–Mar, UTC+2) | 08:00 IST | 06:00 UTC |

To keep 09:00 in winter too, change the cron in the workflow to `0 7 * * *` during winter months.

### How progress is saved

After each successful run the workflow commits `data/progress.json` back to the repo with `[skip ci]` in the message (so it doesn't trigger another run). This is how the next chapter is tracked across days.

---

## Project Structure

```
src/
  cli.ts                  # CLI entry point for GitHub Actions / manual use
  app.module.ts           # Root module
  agentic-files/          # PDF chapter files
  chapters/               # Chapter reading + controller
  ai/                     # Claude API integration
  email/                  # Nodemailer email sending
  progress/               # Progress tracking (JSON file)
  scheduler/              # Daily cron job (used when running HTTP server)
data/
  progress.json           # Tracks which chapter is next (committed to git)
.github/
  workflows/
    daily-agentic-email.yml   # GitHub Actions workflow
.env.example              # Environment variable template
tsconfig.cli.json         # TypeScript config for CLI / ts-node
```
