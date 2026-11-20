# 🏛️ GovDocs AI

Store your documents privately and get any file in the **exact size, format and pixels** a government portal asks for (SSC, UPSC, Railway, Banking, Police, State PSC, CUET, NEET, JEE...).

Next.js + Tailwind (frontend) · NestJS (backend) · PostgreSQL or local file DB · Sharp · pdf-lib · Ghostscript · Clerk · optional AWS S3 + Gemini.

---

## ⚡ Quick start (5 minutes, nothing to sign up for)

1. Install **Node.js 18+** from https://nodejs.org
2. Open this folder in VS Code → Terminal:
   ```bash
   npm run setup     # installs everything, creates .env files
   npm run dev       # starts API (port 4000) + website (port 3000)
   ```
3. Open **http://localhost:3000** → "Open the app".

This runs in **local mode**: one user, no login, files stored encrypted on your own disk (`backend/data/`). No PostgreSQL, AWS or Clerk needed.

### Recommended extras (free, makes PDF/Word features work)
| Tool | Needed for | Install |
|---|---|---|
| **Ghostscript** | Strong PDF compression (e.g. 3 MB → 100 KB), PDF→JPG, text search in scanned PDFs | Windows: https://ghostscript.com/releases · Mac: `brew install ghostscript` · Linux: `sudo apt install ghostscript` |
| **LibreOffice** | DOCX → PDF/JPG conversion | https://www.libreoffice.org |

Settings → *System status* shows what is detected. Without Ghostscript, PDFs are only lightly optimised.

---

## 🔐 Real multi-user login (Clerk)
Gives sign-up, **OTP/email codes, password reset, JWT sessions, multi-device login**.
1. Create a free app at https://clerk.com → copy the keys.
2. `backend/.env`: `CLERK_SECRET_KEY=sk_...`
3. `frontend/.env.local`: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...` and `CLERK_SECRET_KEY=sk_...`
4. Restart. Local mode turns off automatically.

## 🗄️ PostgreSQL / S3 / AI (all optional)
- **PostgreSQL:** `docker compose up -d postgres`, then in `backend/.env` set `DATABASE_URL=postgresql://govdocs:govdocs123@localhost:5432/govdocs` (tables are created automatically). Supabase works the same (add `DB_SSL=true`).
- **Cloudflare R2:** `AWS_S3_BUCKET`, `AWS_REGION=auto`, `S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com` + keys.
- **AWS S3:** set `AWS_S3_BUCKET` (+ standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`). Files are still encrypted by the app before upload.
- **Gemini AI:** set `GEMINI_API_KEY` for screenshot reading and smarter notice parsing. For face-centred photo crops and AI document-type detection also set `AI_IMAGES=true` (this sends those images to Google - off by default for privacy).
- **Hindi OCR:** `OCR_LANGS=eng+hin`. First OCR run downloads language data (internet needed once).

## 🚀 Production
👉 **Full step-by-step: [DEPLOYMENT.md](DEPLOYMENT.md)** (Vercel + Render + Supabase/Neon + R2/S3 + Clerk, or your own VPS with Docker). Ready-made files: `render.yaml`, `frontend/vercel.json`, `backend/fly.toml`, `railway.json`, `deploy/vps/`.

Quick summary:
- Set `NODE_ENV=production`, a long random `ENCRYPTION_KEY` (**back it up - lost key = unreadable files**), `CLERK_SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGIN`, `FRONTEND_URL`, `PUBLIC_API_URL`. The API refuses to start in production without Clerk + key (the dev bypass is disabled).
- `npm run build && npm start`, or `docker compose --profile full up --build` (Docker files are included but were not run in development).
- Frontend → Vercel (set `NEXT_PUBLIC_API_URL`), backend → Railway/Render/VPS with Ghostscript installed (the backend `Dockerfile` installs it).

---

## ✅ What is built (and tested)
Backend smoke test: **46/46 checks passed**.

- **Vault:** upload (any count, up to `MAX_FILE_MB`, default 100), folders, rename, move, delete, search (names + text inside PDFs/photos), preview, download original (byte-identical - tested). Real file type checked from file bytes.
- **Smart download:** format, min/max KB, width, height, DPI, fit, PDF optimise. Binary-searches quality to land inside your KB window; pads JPG/PDF up to a minimum; image→PDF; PDF→JPG; DOCX→PDF (LibreOffice).
- **25 presets** + your own custom presets.
- **Requirement reader:** paste text (works offline with built-in rules) or screenshot (needs Gemini).
- **Photo maker:** plain-background replacement, face/smart crop, auto brightness, contrast, exact size.
- **Signature cleaner:** clean paper, darker ink, tight crop, transparent PNG, exact size.
- **Ready ZIP packages:** e.g. `SSC_CHSL_READY.zip` with `photo.jpg`, `signature.jpg`, `aadhaar.pdf`, with a per-file report.
- **Share links:** expiry, password, download limit, revoke; can share a government-ready copy or a whole package.
- **History**, dashboard, settings (storage, export all as ZIP, delete everything), mobile + tablet + desktop layouts.
- **Security:** AES-256-GCM with a separate key per user, originals never modified, processed copies deleted after download (and by a cleanup job), signed expiring file URLs, rate limiting, input checks.

## ⚠️ Honest limitations
- **Preset values are typical, not guaranteed.** Portals change rules every notice - always check the official PDF or use the requirement reader and save a custom preset.
- **Background replacement** uses colour-based detection. Great on a plain wall, weak on busy backgrounds (you get a warning). Perfect cut-outs need an ML model.
- **Face centring** needs `GEMINI_API_KEY` + `AI_IMAGES=true`; otherwise a smart crop is used.
- **Hard-to-compress PDFs:** if pages must be converted to images to fit a limit, text becomes non-selectable (you are told).
- **Not implemented:** Redis/BullMQ job queue (processing runs inline - fine for personal use), Shadcn CLI (own small components in `components/ui.tsx`), email OTP of our own (Clerk does OTP), Hindi UI.
- Docker files and S3/Clerk/Gemini integrations could not be run in the build sandbox; the code follows the standard APIs but test them with your own keys.

## 🗂️ Structure
```
backend/src   config · entities · common (crypto, storage, auth) · documents (+OCR) · processing (image, pdf, photo/signature, AI) · packages · share · files · misc
frontend/src  app/(app)/* pages · components (ui, Shell, shared dialogs, PresetEditor) · lib (api, hooks, auth)
ui-showcase   the earlier clickable design demo (optional)
```
Change a preset: `backend/src/presets/presets.data.ts`. Change colours/fonts: `frontend/tailwind.config.ts`.
