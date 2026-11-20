# 🚀 Deployment Guide - GovDocs AI

Do raaste hain. Pehle decide karein:

| | **A. Cloud (kam kharch)** | **B. Apna VPS (sab ek jagah)** |
|---|---|---|
| Website | Vercel | Docker + Caddy |
| API | Render (Docker) | Docker |
| Database | Supabase / Neon (Postgres) | Postgres (Docker) |
| Files | Cloudflare R2 ya AWS S3 | Server ki disk (volume) |
| Login | Clerk | Clerk |
| Fit | Shuruaat, kam users | Zyada control, files apne server par |

> Free plans aur unki limits badalti rehti hain. Signup se pehle har service ka pricing page dekh lein. Niche ke menu/button names bhi thode alag ho sakte hain.

---

## 0. Pehle code GitHub par daalein (dono raaston ke liye)
```bash
git init && git add . && git commit -m "GovDocs AI"
# GitHub par khaali repo banayein, phir:
git remote add origin https://github.com/<aap>/govdocs-ai.git
git branch -M main && git push -u origin main
```
`.env` files `.gitignore` mein hain, isliye keys GitHub par nahi jayengi.

## 1. Encryption key banayein
```bash
node scripts/gen-key.js
```
Output ko **password manager mein save karein**. Ye kho gayi to saari stored files hamesha ke liye unreadable ho jayengi.

---

# Raasta A: Vercel + Render + Supabase/Neon + R2/S3 + Clerk

## A1. Database (Postgres)
**Neon** ya **Supabase** par project banayein, connection string copy karein.
- Neon: string mein `sslmode=require` hota hai, theek hai.
- Supabase: "Connect" mein **Session pooler** wali string lein. Direct connection kuch hosts par `ENETUNREACH` (IPv6) deti hai.
Tables pehli baar API chalne par **apne aap** ban jaate hain.

## A2. File storage (koi ek)
**Cloudflare R2:** R2 -> Create bucket (private rehne dein) -> "Manage API tokens" -> *Object Read & Write* token banayein. Aapko ye milega: Access Key ID, Secret, aur S3 endpoint `https://<account-id>.r2.cloudflarestorage.com`.
Env: `AWS_REGION=auto`, `S3_ENDPOINT=<endpoint>`, `AWS_S3_BUCKET=<bucket>`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.

**AWS S3:** private bucket (Block all public access ON), region `ap-south-1`, aur ek IAM user jise sirf is bucket ka `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` ho. `S3_ENDPOINT` khaali chhodein.

> Files app khud encrypt karke bhejti hai, to bucket mein bhi sirf unreadable data rehta hai.

## A3. Clerk (login)
clerk.com -> Create application -> Email (aur chahein to Google) enable. **Publishable key** (`pk_...`) aur **Secret key** (`sk_...`) copy karein.
Test ke liye development keys chalti hain. Asli production instance ke liye Clerk aapka **apna domain** maangta hai (`.vercel.app` par production instance nahi banta).

## A4. API deploy (Render)
1. render.com -> **New -> Blueprint** -> apna GitHub repo chunein (`render.yaml` apne aap padh liya jayega).
2. Jo secrets maange jaayein bharein (neeche list). `PUBLIC_API_URL` abhi ek guess daalein (`https://govdocs-api.onrender.com`), deploy ke baad asli URL se update karenge.
3. Deploy hone par `https://<api-url>/api/health` kholein. Aisa JSON dikhna chahiye: `{"ok":true,"db":"PostgreSQL",...}`.

| Variable | Value |
|---|---|
| `PUBLIC_API_URL` | Render ka API URL (https, bina `/` ke) |
| `FRONTEND_URL` | Vercel ka URL (A5 ke baad) |
| `CORS_ORIGIN` | Vercel ka URL (same, **exact**) |
| `DATABASE_URL` | A1 ki string |
| `CLERK_SECRET_KEY` | `sk_...` |
| `ENCRYPTION_KEY` | Step 1 ki key |
| `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | A2 se (R2 ho to `S3_ENDPOINT` bhi) |

Render free plan par server kuch der use na ho to **so jata hai**, pehli request 30-60 sec le sakti hai. RAM bhi kam (~512MB) hoti hai, isliye `MAX_FILE_MB=25` rakha hai. Bade PDF par memory kam pad sakti hai.
Railway/Fly bhi chalenge: `railway.json` aur `backend/fly.toml` diye gaye hain.

## A5. Website deploy (Vercel)
1. vercel.com -> **Add New -> Project** -> repo import karein.
2. **Root Directory = `frontend`**.
3. Environment Variables (build se **pehle**):
   - `NEXT_PUBLIC_API_URL` = `https://<api-url>/api`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_...`
   - `CLERK_SECRET_KEY` = `sk_...`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
4. Deploy. Phir Vercel ka URL copy karke Render mein `FRONTEND_URL` aur `CORS_ORIGIN` mein daalein aur API **redeploy** karein.

> `NEXT_PUBLIC_*` badalne par Vercel mein **Redeploy** zaroori hai (ye build ke waqt baked hote hain).

## A6. Test (zaroor karein)
1. Website kholein -> Sign up -> dashboard.
2. Ek photo upload karein -> Vault mein dikhe.
3. Smart Download se 20-50KB, 200x230 banayein.
4. Ek share link banayein aur incognito window mein kholein.
5. **Settings -> System status** dekhein: Database = PostgreSQL, File storage = S3.

---

# Raasta B: Apna VPS (Docker + automatic HTTPS)
Kisi bhi Linux VPS par (2GB RAM achha, LibreOffice ke liye zyada).
```bash
# server par: Docker install hona chahiye
git clone https://github.com/<aap>/govdocs-ai.git && cd govdocs-ai/deploy/vps
cp .env.example .env && nano .env      # domain, passwords, keys bharein
docker compose up -d --build
```
DNS mein pehle do A records server ke IP par: `example.com` aur `api.example.com`. Caddy HTTPS certificate khud le leta hai.
Files aur database Docker volumes (`files`, `pgdata`) mein rehte hain. **In volumes ka regular backup lein.**
```bash
docker compose logs -f api          # logs
docker compose pull && docker compose up -d --build   # update
```

---

## Update kaise karein
Code badal kar `git push` karein. Render aur Vercel khud dobara deploy karte hain. VPS par `git pull && docker compose up -d --build`.

## Aam errors aur hal
| Dikhta hai | Wajah | Hal |
|---|---|---|
| Website par "Cannot reach the server" | `NEXT_PUBLIC_API_URL` galat ya build ke baad badla | Sahi karke Vercel **Redeploy** |
| Browser console mein CORS error | `CORS_ORIGIN` Vercel URL se exact match nahi (trailing `/`, http/https) | Exact URL daalein, API redeploy |
| API start hote hi band: "Missing required production settings" | Koi env var chhoot gaya | Error mein naam likha hota hai, wo bharein |
| `401 Session expired` | Frontend aur backend ki Clerk keys alag instance ki | Dono mein ek hi Clerk app ki keys |
| Files redeploy ke baad gayab | S3/R2 set nahi, local disk use ho rahi | `AWS_S3_BUCKET` set karein (Settings mein dikhega) |
| DB error `self-signed certificate` / SSL | SSL setting | `DB_SSL=true` rakhein |
| DB `ENETUNREACH` (Supabase) | IPv6 direct connection | Session pooler string use karein |
| Pehli request bahut slow | Free host so gaya tha | Normal hai; paid plan ya VPS lein |
| PDF compress nahi hota | Ghostscript nahi | Docker image mein hota hai. Bina Docker host par install karein |
| Share link `localhost` dikha raha | `FRONTEND_URL` / `PUBLIC_API_URL` set nahi | Dono set karein |

## Production checklist
- [ ] `ENCRYPTION_KEY` ka backup password manager mein
- [ ] S3/R2 bucket **private**
- [ ] Clerk keys ek hi app ki
- [ ] `CORS_ORIGIN` sirf aapki website
- [ ] Database ka automatic backup on (Supabase/Neon ya VPS volume backup)
- [ ] Dusron ke Aadhaar/PAN store karne se pehle privacy policy aur apni zimmedari samajh lein

## Jo yahan test nahi ho paaya
Docker images, Render/Vercel/Fly/Railway/VPS configs mere sandbox mein **run nahi** kiye gaye (Docker aur aapke accounts nahi the). Ye standard format mein likhe hain aur sirf syntax check hua hai. **Pehle deploy mein ek-do chhote issues aa sakte hain**, error text bhejein to theek kiya ja sakta hai.
Code khud (backend 46/46 tests, frontend production build) test ho chuka hai.
