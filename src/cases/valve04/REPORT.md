# Case 04 — Degenerative Mitral Regurgitation

**Key:** `cv-valve:4` · Valvular & Structural Heart Unit (Cardiology wing, floor 05), bed 4
**Header:** Degenerative Mitral Regurgitation — The Man Who Felt Fine: Timing, Repair & the Leaflet That Blocked the Door
**Patient:** Capt. Rafael Moreno, 52 M, long-haul airline captain and half-marathon runner. Barlow disease (bileaflet billowing) with a flail P2. A murmur has been known since 2019. He reports no symptoms but has quietly stopped running hills. He also has the arrhythmic-MVP phenotype: MAD 7–8 mm, inferior T inversion, papillary-muscle ectopy, LGE, a 5-beat run of NSVT.
**Score total (perfect run):** **429 / 429**

How it differs from the neighbouring cases:
- Case 02: acute primary MR from a flail, treated with TEER.
- Case 05: secondary MR.
- This case: chronic, compensated primary MR in a low-risk patient. The questions are when to operate and how to do a surgical repair well. The crisis is post-repair SAM, where the usual hypotension reflex (inotropes) is the wrong treatment.

## Stages

| # | Stage | What happens | Points |
|---|---|---|---|
| 1 | 🚑 The murmur at the medical | Aviation-medical vignette; `Auscultation` (MVP, chronic MR, HCM, normal) with a handgrip decision; ECG12 with inferior T inversion; CXR and bloods; "what says he is NOT fine"; certificate decision | 26 |
| 2 | 📏 Measure the leak | TTE table (MAD, Pickelhaube); **ProlapseQuant** (PISA + vena contracta, scored 15); severity criteria; edge case: late-systolic MR where EROA overstates; **TwoExitVentricle** + "what EF would a healthy LV show"; exercise echo, CMR, Holter; arrhythmic-MVP decision | 62 |
| 3 | 👥 Heart team | **SurveillanceTrend**: 2019–today plus two projected years, evaluated against the 2025 logic; refer at a visit (scored 12); when, where (centre volume), repair vs TEER; the "I feel fine" conversation | 42 |
| 4 | 🧮 Segments & ring | **MitralMap**: rotate the 3D en-face view into the surgeon's view, mark A1–P3 (scored 12); Carpentier type; SAM risk factors; **RingPlanner**: ring size and posterior leaflet height give AL/PL, C-sept, coaptation, gradient (scored 15); respect vs resect | 51 |
| 5 | 🩸 Set-up | Checklist (dental, coronary CT, aorto-iliac CT, lung isolation, pads, TOE, consent); operation `Sequence`; de-airing; mini vs sternotomy | 15 |
| 6 | 🎬 Choose your path | Branching: leave billowing A2 alone, then seal the P2–P3 indentation leak with another loop; the "no more than mild MR leaving theatre" rule | 30 |
| 7 | 🛠️ The repair | **RepairBench**: neochord loops, papillary-head anchoring, loop length, repeatable saline test with clamp time, ring from the s4 plan, post-bypass TOE (scored 20); refuse adrenaline at weaning | 30 |
| 8 | 🛏️ Back on the unit | ICU arrival; K⁺/Mg²⁺ with ectopy; antithrombotic after ring repair; what to watch; why hypovolaemia is dangerous after this repair | 26 |
| 9 | 🚨 Crisis | Bleeding, diuresis and adrenaline lead to SAM with LVOT obstruction (vitals move). Diagnosis; **SamCrisis**: a live LVOT gradient that responds to 10 actions, 5 helpful and 5 harmful (scored 20); then the bleeding (re-explore); then the definitive plan (no redo unless SAM persists at rest) | 50 |
| 10 | 🧠 Vicious cycles | 3 cycles (SAM spiral; MR begets MR; arrhythmic prolapse loop) + 2 decisions | 20 |
| 11 | 💀 M&M | 6 war stories, every one a death or near-death, 5 scored decisions | 50 |
| 12 | 🏁 Debrief | Discharge plan, 10-question quiz, score table, 10 take-home points, CaseLibrary | 27 |

Kit counts:
- 9 `Why` chains, at least one in every stage 1–9.
- 12 `Contrast` pairs.
- 3 `ViciousCycle`s (5, 5 and 5 nodes; 5, 3 and 3 breaks).
- 6 `WarStory`s.

Decision options are written best-first in the source. A small local wrapper rotates them on screen by a fixed per-question offset, so the best answer is not always "A".

## Simulators built (`sims.jsx`, kit style, `useCanvas` + `cs-*`)

- `ProlapseQuant` — ME long-axis colour TOE of a Barlow valve with a flail P2 and an anteriorly directed, wall-hugging jet. Aliasing velocity, PISA radius caliper and vena contracta caliper; shows EROA, RVol, RF and VC.
- `TwoExitVentricle` — SVG of an LV with two exits. Sliders for regurgitant fraction and true contractility; shows the EF the echo would display, EDV/ESV and an estimated LVESD (inverse Teichholz). Presets include a normal heart, him today and him in 2028. Calibrated to his LVEDD 60 / LVESD ~40 / EF 62%.
- `SurveillanceTrend` — serial LVESD/LVEF/LAVI/SPAP against trigger lines. A per-visit evaluation (`evaluate2025`) gives the class I/IIa logic and lists the criteria. "If we wait…" reveals the projected years. Referral can only be placed from today onward.
- `MitralMap` — rotatable 3D en-face rendering (aortic valve and LAA as landmarks) beside a blank, tap-to-cycle Carpentier map.
- `RingPlanner` — side view through A2–P2. A teaching model maps ring size and posterior leaflet height to AL/PL ratio, C-sept distance, coaptation length, mean gradient and SAM risk.
- `RepairBench` — side view through P2. Loop count, anchoring, loop length (free-edge height), saline-test feedback, clamp time; uses the s4 ring for the post-bypass result.
- `SamCrisis` — PLAX schematic with SAM, LVOT turbulence and a posterior MR jet. On desktop it also draws a CW LVOT "dagger" envelope. 10 actions each update the gradient, BP, HR and SpO₂ through `setVitals`.

Reused from the kit: `Auscultation`, `ECG12` (with `tInv`), `PulmonaryVein`, `BedsideMonitor`.

## Media — and how each item was verified

**YouTube, Wikimedia and most other hosts are blocked from this environment.** `curl` gets a proxy 403, and WebFetch gets ENOTFOUND for youtube.com, ncbi and oup. New videos were verified only through web-search index results that return the youtube.com watch URL and title. Channel names could not be confirmed, so no `channel` is set and `Video` shows "YouTube". **Reviewer: please open each one.**

| Video ID | Title used | Where | Verification |
|---|---|---|---|
| `7pUBljQ4joY` | Mitral valve prolapse — echocardiography series (Dr Ankur K. Chaudhari) | s2 | Search result "MITRAL VALVE PROLAPSE-ECHOCARDIOGRAPHY SERIES BY DR.ANKUR.K.CHAUDHARI - YouTube" |
| `NUUllKPvqQ4` | Echocardiography: LVOT obstruction & SAM | s4 | Search result "〖Echocardiography〗 LVOT obstruction & SAM 🚨 - YouTube" |
| `GYAmSH2zwic` | Robot-assisted minimally invasive mitral valve repair at Mayo Clinic | s5 | Search result "Robot Assisted Minimally Invasive Mitral Valve Repair at Mayo Clinic in Rochester MN - YouTube" |
| `VrIxRfWDOm8` | Robotic mitral valve repair surgery — animation | s5 | Search result "Robotic Mitral Valve Repair Surgery Animation - YouTube" |
| `t9FpQ_wSVD4` | Mitral valve repair surgery — cardiac animation | s7 | Search result "Mitral Valve Repair Surgery - Cardiac Animation - YouTube" |
| `AJLrK8PUtzI`, `S7z5qpNmluY`, `L_8pDi0pEmE` | as in Case 02 | s1, s2, s3 | Reused from `valve02` (already on main) |

Channel search links (`REPAIR_SEARCHES` in `index.jsx`) follow the same `@channel/search?query=` pattern as `valveMedia.js`. I could not open them from here: **unverified**. The end-of-case `CaseLibrary` uses the shared `valveMedia.js` playlist and channels.

Images (Wikimedia Commons; the file pages and licences were confirmed through the search index, not opened directly):
- `File:Heart_mitral_valve_prolapse.svg` — Patrick J. Lynch, CC BY 2.5 (s1)
- `File:Mitralvalve_prolapse.gif` — NHLBI/NIH, public domain (s2)
- `File:Mitral_Valve_Prolapse.png` — BruceBlaus, CC BY-SA 4.0 (s4)
- `File:Mitral_Regurgitation_scheme1.png` — reused from Case 02 (s7)

If an image cannot load, `Figure` falls back to a link.

## Testing

- `npx vite build` passes.
- A Playwright playthrough runs at 1280×900 and 390×844. It covers every stage, answers every decision best, completes every MultiSelect, Sequence and quiz item, and runs all seven simulators. Both sizes: **429/429, no page errors.**
- Screenshots checked:
  - cover, ProlapseQuant, TwoExitVentricle, SurveillanceTrend, MitralMap, RingPlanner, RepairBench, SAM crisis before and after, cycles, score table — on desktop and phone.
  - Fixes made after review: the cover title was shortened; the trend trigger label was moved so it no longer collides with a point label; the RingPlanner/trend SVG text was enlarged for phones; the RepairBench label was kept inside the canvas on phones; the PLAX schematic was redrawn.
- 3D ward: lift → Cardiology → floor 05 → Bed 04. The bed board and bed bar show the header, **Open case** is present, and clicking it opens the case (brand "Structural Heart · Case 04"). No page errors.

## For the clinical reviewer

1. **2025 ESC/EACTS asymptomatic primary MR logic** (from secondary summaries, not the full text, which I could not open here):
   - Class I with LV dysfunction: LVEF ≤ 60%, LVESD ≥ 40 mm or LVESDi ≥ 20 mm/m².
   - Class I repair in low-risk patients without LV dysfunction when a durable repair is likely and **≥ 3** of: AF, resting SPAP > 50 mmHg, LAVI ≥ 60 mL/m² (or LA ≥ 55 mm), TR ≥ moderate.
   - Class IIa with fewer than three.
   - The simulator shows IIa for 1–2 criteria and "surveillance" for 0 criteria. Summaries disagree on whether IIa applies with zero criteria, and on TR wording ("moderate or greater" vs "TR"). **Please check against the guideline text.**
2. **Exercise PH** — presented as supportive, not a standalone ESC 2025 trigger. The best answer in s2-ex reflects that, and "it makes him symptomatic" scores as acceptable.
3. **Arrhythmic MVP** — red flags and management follow the 2022 EHRA consensus as I recall it: ICD class I for secondary prevention; primary prevention individualised. With NSVT + LGE + MAD, some EP teams would favour an ICD. That option scores "acceptable" (4/10), not "wrong".
4. **Antithrombotic after ring repair in sinus rhythm** — low-dose aspirin for 3 months is "best" and a VKA for 3 months is "acceptable" (8/10). Guideline class and wording vary between editions, so please confirm.
5. **SAM thresholds and treatment**:
   - Risk markers used: AL/PL < 1.3, C-sept < 25 mm, posterior leaflet height, small ring, septal bulge, aorto-mitral angle, small hyperdynamic LV.
   - Doses: phenylephrine 100 µg bolus; esmolol 0.5 mg/kg then infusion.
   - The `RingPlanner` and `SamCrisis` equations are teaching models, not validated predictors.
6. **Electrolytes after cardiac surgery** — K⁺ target ~4.5 (many units 4.5–5.0), Mg 2 g IV.
7. **Endocarditis prophylaxis after repair with a ring** — stated as high-risk (ESC 2023: prosthetic material used for valve repair).
8. **Surveillance numbers and projections** (2027/2028) are invented for teaching. The Teichholz-based LVESD in `TwoExitVentricle` is an estimate.
9. **Aviation fitness** — deliberately non-specific ("the authority's cardiology advisers decide"), because rules differ by regulator.
10. **"Valvular AF"** — the AF war story says DOACs are appropriate in MR (consistent with Case 02).

## Attribution note

The commit uses the session footer from this session's instructions. `docs/CASE_CONTRACT.md` quotes a different `Claude-Session` URL, which belongs to the session that wrote the contract.
