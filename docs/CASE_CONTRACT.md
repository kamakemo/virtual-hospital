# 🏥 Virtual Hospital — Case Contract

Every simulated case in this app follows this contract, so that cases written
by different people (or agents) feel like one course. Read it fully before
writing a line. The reference cases are the standard to match or beat:

- `src/cases/valve01/` — Severe aortic stenosis → TAVI → complete heart block
- `src/cases/valve02/` — Acute severe MR → MitraClip TEER → single-leaflet detachment
- `src/cases/cath01/`, `src/cases/cath02/` — Cath lab PCI cases

Open one in the browser (`/#case=cv-valve:1`) and play it through before you start.

---

## 🧠 PHILOSOPHY — "Simple enough to remember, impossible to forget"

Skip traditional education. No textbook regurgitation. No passive reading.

- **Anchor to the body, not the book** — explain WHY things happen
  mechanistically so the student UNDERSTANDS rather than memorizes.
- **Contrast pairs** — always teach what something IS by showing what it ISN'T.
- **War stories that scar the memory** — every M&M section must include a case
  where someone DIED or nearly died from a specific mistake. Not to frighten,
  but to BURN the lesson into permanent memory. Students forget lectures. They
  never forget the story of the patient who died because someone gave a
  beta-blocker before an alpha-blocker in pheochromocytoma.
- **The "WHY behind the WHY"** — When students understand the vicious cycle,
  they never forget the treatment.

How each principle maps to the kit:

| Principle | Component | Minimum per case |
|---|---|---|
| Anchor to the body | `<Why title chain={[{k,t}…]}>` mechanism chain | 1 per stage in stages 1–9, ≥ 8 total |
| Contrast pairs | `<Contrast title is={{h,points}} isnt={{h,points}} />` | ≥ 8 total, spread across stages |
| War stories | `<WarStory title mistake burn>` in the M&M stage | ≥ 5 stories, **every one with a death or near-death**, ≥ 3 followed by a scored `Decision` |
| Why behind the why | `<ViciousCycle id title nodes breaks />` in the cycle stage | ≥ 2 cycles, each with ≥ 4 nodes and ≥ 3 breaks, plus ≥ 1 scored `Decision` |

Never write a paragraph a student could have read in a textbook. If a fact
matters, attach it to a mechanism, a contrast, a decision or a story.

---

## 😀 Emoji — use them generously

The app's visual language is neon-dark with lots of emoji. Use them:

- every stage has an `icon` emoji and a `pill` that starts with an emoji;
- every `cs-h2` section heading starts with an emoji (`🫀 Bedside echo`, `🧪 Bloods`, `📈 Pressures`);
- `Why`, `Contrast`, `ViciousCycle` and `WarStory` titles start with a fitting emoji;
- take-home points each start with an emoji;
- vignette time stamps can carry one (`🚑 21:40`);
- hero `cards` keys and the hook may use them.

Do NOT put emoji inside drug doses, numbers, units or answer options where
they would distract from the clinical content. One emoji per heading, not five.

---

## 🧱 Structure — 12 stages, always

| # | id | Stage | What it must contain |
|---|---|---|---|
| 1 | `s1` | 🚑 Presentation & triage | Vignette with time stamps, observations, examination, an interactive sign/ECG/sound, bloods/imaging, the key first decisions |
| 2 | `s2` | 📏 Investigation / measurement | The definitive test **performed by the learner** with a simulator (measure, calculate, grade) + discordant/edge examples |
| 3 | `s3` | 👥 Decision / heart team | Whether and how to treat, risk, patient goals, a consent or communication decision |
| 4 | `s4` | 🧮 Planning | Anatomy/sizing/route/drug planning; at least one interactive planner |
| 5 | `s5` | 🩸 Set-up | Checklist, `Sequence` of steps, safety |
| 6 | `s6` | 🎬 Strategy / choose your path | Branching decisions with consequences |
| 7 | `s7` | 🛠️ The procedure or treatment | The core hands-on simulator, scored by how well it is done |
| 8 | `s8` | 🛏️ Back on the unit | Post-procedure checks, drugs at the right dose, what to monitor and why |
| 9 | `s9` | 🚨 The crisis | A realistic complication with vitals that move (`setVitals`), recognition, immediate actions, definitive fix |
| 10 | `cyc` | 🧠 The vicious cycle | ≥ 2 `ViciousCycle`s + decisions |
| 11 | `mm` | 💀 M&M war stories | ≥ 5 `WarStory`s, each with a death or near-death |
| 12 | `s10` | 🏁 Discharge, debrief & assessment | Discharge plan, a 10-question `Quiz`, the score table, ≥ 8 take-home points, a `CaseLibrary` |

The case definition object shape (copy it from `src/cases/valve02/index.jsx`):
`title, short, patient {name, meta, flags}, contrastBudget, clock0, vitals0,
brand {icon, line}, hero {badges, lines, hook, image, sims, crisis, cards},
stages [{ id, icon, nav, title, Component, pill, lede, enter }]`.

- `clock0` and `enter` clocks are minutes; use `min(h, m)`, and add 24 h per
  day (`min(24 + 9, 30)` = 09:30 next day) — the clock only moves forward.
- `vitals0` and `enter` set `{ hr, sys, dia, spo2, rr, st, rhythm }`;
  `rhythm` is `'sinus' | 'af' | 'chb' | 'paced'`.

---

## 🧰 The kit (use it, do not edit it)

`src/cases/kit/CaseKit.jsx`
- `CaseShell({ def, onClose })` — the whole shell; your default export renders it.
- `Decision({ id, question, options:[{id,label,verdict:'best'|'ok'|'wrong',points,why,feedback}], onAnswer })` — first answer is scored; give every option a `why`.
- `MultiSelect({ id, question, items:[{id,label,correct,why}] })`
- `Sequence({ id, question, steps:[{label,why}] })`
- `Steps/Step` — unlocking procedure steps (see `cath01` Intervention).
- `Note({ kind:'pearl'|'warn'|'evid', title })`, `Why`, `Contrast`, `WarStory`, `ViciousCycle`
- `BedsideMonitor()` — live ECG/arterial/pleth from the case vitals.
- `Figure({ src, href, alt, caption, credit })`, `Video({ id, title, channel, list })`, `CaseLibrary({ title, playlist, start, channels })`
- `Quiz({ id, items:[{q,options,answer,why}] })`
- `useCase()` → `{ answers, answer, setVitals, bump, advanceClock, atLeastClock, totals, def, metrics }`

`src/cases/kit/ECG12.jsx` — `ECG12({ rate, st, tInv, lbbb, rhythm:'sinus'|'af'|'chb'|'paced', atrialRate, pr, shape, caption })`

`src/cases/kit/Valve.jsx` — `Auscultation({ lesions })` (lesions: `as-severe`, `as-mild`, `hcm`, `mr-acute`, `mr-chronic`, `mvp`, `normal`),
`Doppler({ kind:'cw-as'|'pw-lvot', vmax, onMeasure })`, `Hemodynamics({ mode:'as'|'post' })`, `TaviDeploy`, `Pacer`,
`ColorMR`, `PulmonaryVein({ reversal })`, `LAPressure({ mode:'acute'|'post'|'slda' })`, `TransseptalPuncture`, `ClipGrasp`

`src/cases/kit/Physiology.jsx` — `Barbeau`, `PressureWire`, `CatheterPressure`, `Inflator`, `Echo({ effusion, tamponade })`

`src/cases/kit/Angio.jsx`, `IVUS.jsx`, `Monitor.jsx` — see `cath01` / `cath02` for use.

**Need something the kit does not have** (a new murmur, a new Doppler
pattern, a pericardiocentesis needle, a ventilator…)? Build it **inside your
own case folder** (e.g. `src/cases/valve06/sims.jsx`), in the kit's style:
canvas via `useCanvas` from `../kit/Monitor.jsx`, the `cs-*` classes, the same
dark palette. Name it as if it were going into the kit; it may be promoted later.

---

## 📁 Files you may touch

Only your own folder: `src/cases/<yourcase>/`
- `index.jsx` — the case (default export renders `CaseShell`)
- `meta.js` — `export default { key: 'cv-valve:6', header: 'Rheumatic Mitral Stenosis — …' };`
- any local simulators or data files

The registry discovers your folder automatically and `meta.js` puts your case
on its bed with its header. **Do not edit** `src/cases/kit/*`,
`src/cases/registry.js`, `src/hospital/*`, `src/App.jsx`, CSS, or other cases.

---

## 🎬 Media

- **Videos**: prefer these channels, and verify each video is really from them:
  - CCC Live Cases — https://www.youtube.com/@CCCLiveCases
  - Gulf Intervention Society — https://www.youtube.com/@gulfinterventionsociety
  - Interventional Cardiology — https://www.youtube.com/@interventionalcardiologyis3814
  - Playlist — https://www.youtube.com/playlist?list=PLL56ySoEct85rmEcFlaOrLGJbv-9v7FFM

  Search them with `/search?query=…`. Use good educational videos from other
  channels where these have nothing (pathophysiology animations, echo
  teaching). Every `Video` gets a correct `title` and `channel`.
- **Images**: Wikimedia Commons via
  `https://commons.wikimedia.org/wiki/Special:FilePath/<file>?width=960`, with
  `href` to the `File:` page and a correct licence credit. Check each file exists.
- Every link you add must be one you have opened and checked. No invented IDs.
- End the debrief with `<CaseLibrary … />` using `src/cases/valveMedia.js`.

---

## ⚕️ Clinical standard

- Follow current guidelines (ESC/EACTS 2025 valvular heart disease; ESC 2023
  endocarditis; ESC 2024 AF; ESC 2023 ACS; ESC 2024 CCS; ESC 2021/2023 HF;
  AHA/ACC where relevant). Say which in the file header comment.
- Doses, thresholds and criteria must be correct. When guidelines differ or
  evidence is uncertain, say so in the `why`.
- War stories are **composite teaching cases** — never real, identifiable
  patients; the `WarStory` footer already says so.
- Names: invented patients with realistic names; vary age, sex and background.

---

## 🎯 Scoring

- Most decisions 10 points for best; 'ok' 2–6; 'wrong' 0–2.
- Simulator performance scored with `ScoreOnce` (see valve01/valve02), 10–20 points.
- Quiz: 10 questions × 2 points.
- The full score must be reachable by a perfect run.

---

## ✅ Definition of done

1. `npx vite build` succeeds.
2. Automated playthrough with Playwright (`playwright-core` in a scratch folder;
   Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, args
   `['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']`;
   `npx vite preview --port 5180` in the background — never `pkill -f vite`,
   which kills your own shell):
   open `/#case=<your key>`, click **Scrub in** (`.cs-cta`), go through every
   stage via `.cs-nav-item`, answer every decision correctly, run every
   simulator; the score table must show full marks with **no page errors**.
   See `drive` scripts described in valve02 history for the pattern.
3. Screenshots of the cover, each simulator and the crisis look right (no
   overlapping, nothing cut off, readable at 1280×900 and 390×844).
4. The bed shows your header and **Open case** in the 3D ward (lift → floor → bed).
5. Commit with a clear message ending with:

   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_01EeKyVxTj2Ux1NL1Zad1o86
   ```

   and push **to your own branch only** (never `main`). Do not open a pull request.
6. Write `src/cases/<yourcase>/REPORT.md`: stages, simulators built, every
   video/image with its verified source, the score total, and anything the
   reviewer should check.
