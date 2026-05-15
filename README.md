# 🤖 Daily Agentic Learning Agent

> One chapter a day. Every morning, get a deep bilingual breakdown of an Agentic AI design pattern — delivered straight to your inbox.

Each day the agent picks the next topic from a 22-chapter curriculum on Agentic AI, generates a rich explanation using Claude, and emails it to you in both **English and Hebrew**.

---

## 📚 What You'll Learn

A new agentic design pattern every day. Examples of what lands in your inbox:

| Day | Topic |
|-----|-------|
| 1 | 🧠 Introduction to Agentic AI |
| 2 | 🔗 Prompt Chaining |
| 3 | 🔀 Routing |
| 4 | ⚡ Parallelization |
| 5 | 🪞 Reflection |
| 6 | 🛠️ Tool Use |
| 7 | 📋 Planning |
| 8 | 🤝 Multi-Agent Systems |
| 9 | 💾 Memory Management |
| 10 | 🧬 Learning and Adaptation |
| ... | and 12 more chapters |

Each email includes:
- **TL;DR** — the core idea in 5 minutes
- **Deep dive** — full technical explanation
- **TypeScript/NestJS code example** — real, runnable code
- **How companies use this** — GitHub Copilot, Notion AI, Linear, etc.
- **If you remember only 3 things** — the key takeaways
- **הסבר בעברית** — full explanation in natural Israeli Hebrew
- **Interview notes** — how to answer this in a senior engineer interview
- **Mini project** — something you can build in 1–2 hours

---

## 🏗️ How It Works

```
PDF Chapter → Claude API → Styled HTML Email → Your Inbox
```

1. The app reads the next chapter PDF
2. Sends it directly to Claude (multimodal — Claude sees diagrams too)
3. Generates a bilingual teaching email
4. Delivers it to your inbox
5. Updates progress so tomorrow it sends the next chapter

Progress is tracked in `data/progress.json` and committed back to the repo after each run.

---

## 🚀 Setup

### 1. Clone and install

```bash
git clone https://github.com/shonsalomonovitch/daily-agentic-learning-agent
cd daily-agentic-learning-agent
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-haiku-4-5-20251001
MAX_TOKENS=16000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_TO=recipient@example.com

DAILY_CRON=0 9 * * *
```

### 3. Gmail App Password

Gmail requires an App Password (not your regular password) when 2FA is enabled:

1. Go to **Google Account → Security → App Passwords**
2. Create a new one — name it anything
3. Paste the 16-character password into `EMAIL_PASS`

---

## 🖥️ Run Locally

```bash
# Send the next chapter right now
npm run send-next

# Or start the HTTP server (includes daily cron + REST API)
npm run start:dev
```

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chapters` | List all 22 chapters |
| `POST` | `/chapters/send/:n` | Send a specific chapter |
| `POST` | `/chapters/send-next` | Send the next chapter |
| `POST` | `/chapters/reset-progress` | Start over from chapter 1 |

---

## ⚙️ GitHub Actions — Fully Automated

The workflow runs every day at **09:00 Israel time**, no server needed.

### Step 1 — Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `ANTHROPIC_MODEL` | e.g. `claude-haiku-4-5-20251001` |
| `EMAIL_HOST` | e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | e.g. `587` |
| `EMAIL_USER` | Your sending email address |
| `EMAIL_PASS` | Your Gmail App Password |
| `EMAIL_TO` | Where to deliver the email |

### Step 2 — Trigger manually to test

Go to **Actions → Daily Agentic Learning Email → Run workflow**

That's it. Every morning the next chapter lands in your inbox automatically. ☀️

---

## 🗂️ Project Structure

```
src/
  cli.ts              # CLI entry — used by GitHub Actions
  app.module.ts       # Root NestJS module
  agentic-files/      # 22 PDF chapters
  chapters/           # Reads and sorts chapters
  ai/                 # Claude API integration
  email/              # Sends styled HTML emails
  progress/           # Tracks which chapter is next
  scheduler/          # Daily cron (when running as HTTP server)
data/
  progress.json       # Persisted progress (committed to git)
.github/workflows/
  daily-agentic-email.yml   # Automated daily workflow
```

---

## 🛠️ Tech Stack

- **[NestJS](https://nestjs.com/)** — framework
- **[@anthropic-ai/sdk](https://www.npmjs.com/package/@anthropic-ai/sdk)** — Claude API
- **[Nodemailer](https://nodemailer.com/)** — email delivery
- **[pdf-parse](https://www.npmjs.com/package/pdf-parse)** — PDF reading
- **[@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)** — cron jobs
- **GitHub Actions** — automated daily runs
