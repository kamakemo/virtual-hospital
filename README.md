# Virtual Teaching Hospital — v2.0 (Cloud Edition)

A clinical reasoning platform for medical students, residents, and postgraduates.
Built for **AlGhad College — EMS & Internal Medicine education**.

This version is **cloud-powered**: cases live in Supabase, students sign in with
magic link, and every edit you make in the admin panel is instantly visible to
everyone.

---

## ⚡ Setup Checklist

**Before starting, you need:**

- A **GitHub** account (signed up)
- A **Vercel** account (signed in with GitHub)
- A **Supabase** project created
- Node.js 18+ installed locally

If you don't have these yet, set them up first.

---

## 🚀 First-Time Setup (15 minutes)

### Step 1 — Configure Supabase

1. Open your Supabase project → **SQL Editor** → **+ New query**
2. Open the file `supabase-setup.sql` from this project, **copy its entire contents**, and **paste** into the SQL editor
3. **IMPORTANT:** find the line near the bottom that says:
   ```
   -- insert into public.admins (email) values ('your.email@example.com')
   ```
   **Uncomment** it (remove the `--`) and replace the email with **the email you'll use to sign in**.
4. Click **Run**. You should see "Success."
5. In your Supabase project, go to **Project Settings → API** and copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public key** (long string starting with `eyJ`)

### Step 2 — Configure Email (Magic Link) in Supabase

1. In Supabase, go to **Authentication → Providers**
2. Make sure **Email** is enabled (it is by default)
3. Under **Authentication → URL Configuration**:
   - **Site URL:** put your Vercel URL here, e.g., `https://virtual-hospital-eta.vercel.app`
   - **Redirect URLs:** add the same URL plus `http://localhost:5173` for local dev
4. Save

### Step 3 — Configure environment variables locally

1. In your project folder, copy `.env.local.example` to a new file named `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and replace the two placeholders with your real values from Step 1.
3. Save.

### Step 4 — Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. You'll see a sign-in screen. Enter your email
(the one you put in the admins table), check your inbox, click the magic link,
and you're in.

### Step 5 — Deploy to Vercel

1. **Push this code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Cloud edition v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/virtual-hospital.git
   git push -u origin main
   ```
   *(or upload via the GitHub web UI if you prefer)*

2. **Connect Vercel:**
   - Go to vercel.com → **New Project**
   - Import your `virtual-hospital` repo
   - **Important:** before clicking Deploy, expand **Environment Variables** and add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your anon public key
   - Click **Deploy**

3. After deployment, **go back to Supabase → Authentication → URL Configuration**
   and make sure your Vercel URL is in **Site URL** and **Redirect URLs**.

Done! Anyone you grant admin access to can now author cases at the live URL.

---

## 👤 Adding More Admins

When you want to give another faculty member admin access:

1. They sign in with magic link **at least once** (so an account is created)
2. You go to Supabase → **SQL Editor** and run:
   ```sql
   insert into public.admins (email) values ('their.email@example.com');
   ```
3. They sign out and sign back in. The Admin nav item now appears for them.

---

## 🔐 How Access Works

| User type | Can do |
|---|---|
| **Not signed in** | Sees the login screen only |
| **Signed-in student** (any email) | Browses all cases, tracks own progress, takes MCQs |
| **Signed-in admin** (email in `admins` table) | Everything above + creates/edits/deletes cases |

Cases are shared globally. Every signed-in user sees the same set of cases.
Progress (XP, completed stages, MCQ scores) is per-user.

---

## 🏥 What's Included

**Two virtual hospitals**, each organized into **8 departments** with patient
beds you can hover and click:

- **Cardiology**: ED, CCU, Heart Failure, Cath Lab, Valvular & Structural,
  EP Lab, Cardiac Imaging, Outpatient Clinic
- **Internal Medicine**: Respiratory, Critical Care, Hematology & Oncology,
  Endocrinology, Rheumatology & Immunology, Nephrology, Neurology, GIT & Hepatology

**5 starter cases** auto-load on first admin sign-in:
STEMI, Acute Heart Failure, Septic Shock, Massive PE, DKA.

**19 clinical workflow stages** per case (fully customizable per case — rename,
reorder, hide, add custom ones).

**Advanced rich-text editor** with image upload (auto-compressed), ECG/imaging
upload, YouTube embeds, video embeds, callout boxes, tables, code blocks, full
text styling (colors, highlights, alignment, sizes), and HTML source toggle.

**Live ECG simulator**, lab trend charts, MCQ assessments with mistake feedback,
role-based gamification (Student → Resident → Consultant), 3D bed visualization,
dark/light mode.

---

## 🛠️ Day-to-Day Workflow

### To author or edit cases
1. Sign in at your live URL with your admin email
2. Click **Admin** in the top nav
3. Edit anywhere, click **Save** — saves to Supabase instantly
4. Students see changes on next page reload

### To deploy code changes (when Claude or you change the source)
```bash
git add .
git commit -m "describe what changed"
git push
```
Vercel auto-deploys within ~30 seconds.

### To back up your cases
In the Admin panel, click **Export backup** → downloads a JSON file with every case.

---

## 📁 File Structure

```
virtual-hospital/
├── public/
│   └── favicon.svg
├── src/
│   ├── VirtualHospital.jsx    ← entire app (~3,400 lines)
│   ├── supabaseClient.js      ← Supabase config & helpers
│   ├── main.jsx                ← React entry point
│   └── index.css               ← Tailwind directives
├── index.html
├── supabase-setup.sql          ← run this once in Supabase
├── .env.local.example          ← copy to .env.local with your keys
├── .env.local                  ← your real keys (NEVER commit, in .gitignore)
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🐛 Troubleshooting

**"Supabase configuration missing" screen appears**
→ `.env.local` is missing or has wrong values. Double-check the file exists in the project root with both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart `npm run dev` after editing.

**Magic link email never arrives**
→ Check spam folder. Also check **Supabase → Authentication → URL Configuration** — your URL must be in the redirect list.

**"Admin access only" appears even though I added myself**
→ Sign out and sign back in (the admin status is checked at sign-in time). Or run `select * from admins;` in Supabase SQL editor to verify your email is exactly there with no typos.

**"Failed to fetch" or RLS errors**
→ Run `supabase-setup.sql` again — the Row Level Security policies may not be applied. The script is safe to re-run.

**Vercel deploys but the live site shows config error**
→ Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Vercel → Project Settings → Environment Variables**, then redeploy from the Vercel dashboard.

**Image upload says "too large"**
→ Files are auto-compressed up to 25 MB original size. For files larger than that, compress manually first.

---

Educational use only — not for clinical decision-making.

Built with ❤️ by Kemo + Claude.
