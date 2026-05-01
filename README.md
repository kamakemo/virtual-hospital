# Virtual Teaching Hospital

A clinical reasoning platform for medical students, residents, and postgraduates.
Built for **AlGhad College — EMS & Internal Medicine education**.

Features two virtual hospitals (Cardiology and Internal Medicine) organized by
**departments and patient beds**, just like a real hospital:

**Cardiology Hospital** — Emergency Department · CCU · Heart Failure Ward ·
Cath Lab · Valvular & Structural · EP Lab · Cardiac Imaging · Outpatient Clinic

**Internal Medicine Hospital** — Respiratory · Critical Care Unit ·
Hematology & Oncology · Endocrinology · Rheumatology & Immunology ·
Nephrology · Neurology · GIT & Hepatology

Each department shows a 3D ward floor with isometric patient beds — hover over a
bed to see vitals and case summary, click to enter the full case workflow.

Other features: 19 clinical workflow stages per case (fully customizable per case —
rename, reorder, hide, or add new ones), live ECG simulator, lab trend charts,
MCQ assessments with mistake feedback, role-based gamification (Student → Resident →
Consultant), and a powerful admin panel with an advanced rich-text editor that
supports image uploads, ECG/imaging uploads, YouTube and video embeds, callout
boxes (clinical pearls / warnings / notes), tables, code blocks, full text styling
(colors, highlights, alignment, sizes), and an HTML source toggle.

---

## Quick start (3 commands)

You need **Node.js 18 or newer** installed first. Get it from https://nodejs.org if you don't have it.

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

That's it. Your browser will open automatically at `http://localhost:5173`.

---

## What each command does

| Command | What it does |
|---|---|
| `npm install` | Downloads all dependencies (run this once, the first time) |
| `npm run dev` | Starts the development server — use this every time you want to work on it |
| `npm run build` | Builds a production version into the `dist/` folder |
| `npm run preview` | Previews the production build locally |

---

## Admin panel

Click the **Admin** button in the top navigation. The demo passcode is:

```
algahd2026
```

You can change this passcode in `src/VirtualHospital.jsx` — search for `algahd2026`
and replace both occurrences (one in the auth check, one in the help text).

In the admin panel you can:
- Create, edit, and delete cases
- Use the rich text editor for any of the 19 stages
- Edit patient profile, vitals, tags
- Build MCQ assessments with explanations
- Edit lab trend data as JSON
- Export all your cases to a JSON file (backup)

---

## Where data is stored

All cases, progress, and settings are stored in your browser's `localStorage`
under keys starting with `vh:`. Data persists across reloads but is per-browser.

To reset everything: open browser DevTools → Application → Local Storage → delete
the `vh:*` keys, then reload.

---

## Deploying

To put this online:

```bash
npm run build
```

Upload the contents of the resulting `dist/` folder to any static host:
- **GitHub Pages** (free)
- **Netlify** (free, drag-and-drop the `dist` folder onto netlify.com)
- **Vercel** (free, connect your GitHub repo)

For GitHub Pages, you'll need to add a `base` option to `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/',  // add this line
})
```

---

## File structure

```
virtual-hospital/
├── public/
│   └── favicon.svg
├── src/
│   ├── VirtualHospital.jsx    ← the entire app (everything is here)
│   ├── main.jsx                ← React entry point
│   └── index.css               ← Tailwind directives
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

Everything you'd want to customize lives in `src/VirtualHospital.jsx`:
- `SEED_CASES` array (top of file) — the 5 starter cases
- `STAGES` array — the 19 clinical workflow stages
- `ROLES` array — XP thresholds for gamification
- `SEVERITY` object — color coding for stable/urgent/critical

---

## Troubleshooting

**`npm install` fails**
Make sure Node.js is version 18 or newer: run `node --version` to check.

**Port 5173 already in use**
Kill the other process or change the port in `vite.config.js`.

**Dark mode doesn't toggle**
Click the sun/moon icon in the top right. The choice persists in localStorage.

**Lost my progress / cases after clearing browser data**
That's expected — `localStorage` is browser-local. Use the admin panel's
**Export** button to back up your cases as JSON.

---

Educational use only — not for clinical decision-making.
