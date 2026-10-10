# Valvular & Structural Case 06 — Rheumatic Mitral Stenosis with AF

`cv-valve:6` · bed 6, Valvular & Structural Heart Unit · branch `case/valve06-rheumatic-ms`

**Header:** Rheumatic Mitral Stenosis with AF — Pregnancy, the Balloon & the Bleed Around the Heart

**Patient:** Mrs Hodan Warsame, 27, originally from Somalia, G2P1, 24 weeks pregnant. She had rheumatic fever at 11 that was never diagnosed. She presents with pulmonary oedema and new fast AF.

**Guidelines followed:** ESC/EACTS 2025 VHD, ESC 2018 cardiovascular disease in pregnancy, ESC 2024 AF, ESC 2023 endocarditis, INVICTUS (NEJM 2022), ASE/EACVI valve stenosis, and AHA/WHF rheumatic fever prophylaxis.

## Stages

| # | id | Stage | Interactive / scored | Max |
|---|---|---|---|---|
| 1 | s1 | 🚑 Drowning at 24 weeks | MS auscultation + "name that sound" (10); heart-rate/gradient model, find her HR ceiling (10); ECG12 AF; 3 decisions, 1 multi-select | 48 |
| 2 | s2 | 📏 Measure the valve | PHT Doppler by hand (12); planimetry with level/gain/trace (12); decision; multi-select | 39 |
| 3 | s3 | 👥 Pregnancy heart team | PMC vs surgery vs waiting vs termination; contraindications; consent about radiation | 27 |
| 4 | s4 | 🧮 Planning | Wilkins score builder (10); Inoue sizing (height/10+10); puncture site | 30 |
| 5 | s5 | 🩸 Set-up | Checklist (left tilt, TOE, LMWH timing, shielding); 6-step sequence | 13 |
| 6 | s6 | 🎬 Strategy | Endpoints, MR rise, what to measure | 30 |
| 7 | s7 | 🎈 Commissurotomy | `Steps`: kit TransseptalPuncture (10) → InoueBalloon cross/hook/stepwise inflation (20) → ASD and protamine decisions | 42 |
| 8 | s8 | 🛏️ Back on the unit | Valvular AF anticoagulation in pregnancy (LMWH → warfarin, no DOAC); metoprolol vs atenolol; monitoring | 27 |
| 9 | s9 | 🚨 14:10 tamponade | Vitals move with `setVitals`; kit Echo with tamponade; diagnosis, immediate actions; Pericardiocentesis sim (15) with vitals that recover as fluid is drained; definitive plan; arrest in pregnancy note | 42 |
| 10 | cyc | 🧠 Vicious cycles | 3 cycles: tachycardia, atrial stasis→stroke, rheumatic recurrence; 2 decisions | 20 |
| 11 | mm | 💀 War stories | 7 stories, each with a death or near-death; 3 scored decisions | 30 |
| 12 | s10 | 🏁 Delivery & debrief | Labour/postpartum vignette; discharge multi-select; 10-question quiz; score table; 10 take-home points; CaseLibrary | 27 |

**Total: 375 points.** An automated perfect run scores **375 / 375 with 0 page errors**, at both 1280×900 and 390×844.

Teaching-device counts:
- `Why`: 11
- `Contrast`: 11
- `WarStory`: 7, with 3 followed by a scored `Decision`
- `ViciousCycle`: 3, each with ≥ 4 nodes and ≥ 3 breaks, plus 2 scored decisions

## Simulators built locally (`sims.jsx`, kit style, promotable)

- **MSAuscultation:**
  - Synthesised loud S1, opening snap and low rumble.
  - Severity changes the S2–OS interval (110/80/50 ms) and the rumble length.
  - Toggles between AF and sinus rhythm; presystolic accentuation is present only in sinus.
  - Compares her heart with split S2, S3 and normal sounds.
  - Includes a scored three-sound identification task.
- **FillingGradient:**
  - Teaching model: diastolic filling time per beat and per minute from the heart rate.
  - Gradient = 8·(Q/153)²·(0.9/MVA)², with LA = 8 + gradient.
  - AF reduces cardiac output by 5% and raises the gradient by 20%.
  - The learner finds the highest heart rate that keeps LA ≤ 22 mmHg (≈ 84/min, pregnant, in AF).
  - It is a teaching model, calibrated so that the gradient at a heart rate of 96 is about 16 mmHg, which matches the echo table. It is not a validated Gorlin calculation.
- **PHTDoppler:**
  - CW mitral inflow in AF with an early steep segment and then the mid-diastolic slope.
  - The learner lays the slope line; DT, PHT = 0.293·DT and MVA = 220/PHT follow.
  - True PHT is 240 ms (MVA 0.92 cm²).
- **Planimetry:** the scan plane runs through a funnel (smallest orifice at the tips), with gain options low (dropout, over-estimates), normal and high (blooming, under-estimates), and a trace ellipse.
- **WilkinsBuilder:** four components × four standard descriptors. Her score is 2+2+1+2 = 7.
- **InoueBalloon:**
  - RAO view: aim the stylet at the apex (posterior aim → chordal warning), cross, inflate the distal balloon and hook it on the valve, then inflate fully with an hourglass waist.
  - Sizes 23–28 mm; reference 26 mm.
  - MR rises with oversizing or 2 mm jumps.
  - Best path is 24 → 25 → 26 and stop: MVA 1.75 cm², mild MR.
- **Pericardiocentesis:**
  - Sagittal sketch of a subxiphoid approach: choice of aim, angle to the skin and depth.
  - Possible outcomes: liver, costal cartilage, fluid, or RV contact (ST elevation).
  - Then agitated saline and drainage in 80 mL steps, with the vitals recovering.

Kit components reused: `ECG12` (rhythm 'af'), `BedsideMonitor`, `TransseptalPuncture`, `Echo` (Physiology, tamponade), plus all the teaching widgets.

## Media

**Network note:** YouTube, Wikimedia Commons and noembed were blocked by the egress proxy (HTTP 403, and DNS failure for WebFetch). Because of that:
- I could not open any video page or `ytInitialData`, so I could not confirm any channel.
- Every video ID below was confirmed only as an *ID + title pair* returned by a web-search index of youtube.com (the WebSearch tool).
- Channel names are therefore left off; the kit shows "YouTube".
- **Please open each one before release.**
- **No images were added**, because no Wikimedia file could be checked.

| Where | id | Title (from search index) |
|---|---|---|
| s1 | VI-dIsMha6Y | Mitral Stenosis: Opening Snap & Rumbling Murmur (USMLE) |
| s1 | MKTqnIrx4g8 | Acute rheumatic fever and rheumatic heart disease explained |
| s2 | 5h6_q3qmeBw | Pressure half time in Mitral Stenosis |
| s4 | DnUqrsGaxRE | Wilkins Echocardiographic Score for Mitral Stenosis |
| s7 | evPQWfYLJeU | Mitral balloon valvotomy: the basic steps (Inoue balloon real case) |
| s7 | WEdOwn1mzcU | Live case of balloon mitral valvuloplasty (search snippet: Prof Brian Bailey, RPA Sydney) |
| s7 | OOarHfU8JiA | How to guide a transseptal puncture with echocardiography (already used in Case 02) |
| s9 | 61FPmtw5RAM | Ultrasound-Guided Pericardiocentesis |

Channel *search* links (in `media.js`, not video IDs) point at the recommended channels with `search?query=mitral%20valvuloplasty` / `PTMC`. The debrief uses the shared `CaseLibrary` from `valveMedia.js`.

## For the clinical reviewer — please check

1. **Anticoagulation in pregnancy for MS + AF:**
   - The case teaches therapeutic LMWH (1 mg/kg twice daily, anti-Xa guided), then IV UFH from 36 weeks, then postpartum warfarin with INR 2–3.
   - The `why` mentions that VKA in the second and early third trimester is an option in some guidance.
   - No numeric anti-Xa target is given for AF; local protocols differ.
2. **PMC in pregnancy:**
   - Framed as "should be considered" for severe MS with persistent symptoms or PASP > 50 mmHg despite medical therapy, after 20 weeks (ESC 2018).
   - The fetal-loss figure for cardiopulmonary bypass is given as ~20–30%.
3. **Stepwise Inoue endpoints and the 1 mm increments:** practice varies (some operators use 2 mm steps). The sim penalises 2 mm jumps.
4. **Puncture site for PMC:** the case teaches mid-to-inferior posterior. It is scored as kit height ≤ 4.2 cm and anterior ≤ 0.5.
5. **Rate-control ceiling (~80–85/min):** this comes from the teaching model, not from guideline text.
6. **Tamponade management:**
   - A 250 mL bridging fluid bolus is marked correct.
   - Protamine is marked correct.
   - IV furosemide and beta-blocker are marked wrong.
7. **Secondary prophylaxis:**
   - Benzathine penicillin G 1.2 MU IM every 3–4 weeks.
   - Duration: 10 years after the last episode or to age 40, whichever is longer, often lifelong.
   - Native rheumatic valves are taught as *not* ESC high-risk for dental endocarditis prophylaxis.
8. **Oxytocin and the postpartum period:**
   - Oxytocin by slow infusion, with the bolus shown as harmful.
   - The 24–72 h postpartum high-dependency monitoring advice.
9. **Videos:** confirm the channel and content of every video listed above (not verified, see the network note).

## Verification

- `npx vite build` passes.
- The Playwright drive (playwright-core, Chromium 1194, swiftshader, `vite preview` on port 5180):
  - Opens `/#case=cv-valve:6` and clicks Scrub in.
  - Visits all 12 stages via `.cs-nav-item`.
  - Answers every decision correctly and runs every simulator.
  - Result: 375/375 with no page errors, at 1280×900 and at 390×844.
- Screenshots of the cover, each simulator and the crisis were checked.
- The bed header comes from `meta.js` via the registry.
