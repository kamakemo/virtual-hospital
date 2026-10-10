# Case AR-58 — Severe Aortic Regurgitation (`cv-valve:11`)

**Header:** Case AR-58 — Severe Aortic Regurgitation: the Collapsing Pulse and the Night the Aorta Tore
**Unit / bed:** Valvular & Structural Heart Unit, bed 11 · **Deep link:** `/#case=cv-valve:11`
**Patient:** Mr Idris Bello, 58, PE teacher. Bicuspid aortic valve (L–R fusion), chronic severe AR, ascending aorta 51 mm, lost to follow-up, father died suddenly at 61.
**Guidelines used:** 2025 ESC/EACTS valvular heart disease; 2024 ESC peripheral arterial and aortic diseases; EACVI/ASE regurgitation quantification; 2023 ESC endocarditis.

## Score

**Full score: 410 / 410.** An automated Playwright playthrough got full marks at 1280×900 and at 390×844 with no page errors.

| Stage | Max |
|---|---|
| 1 🚑 The pounding in his neck | 31 |
| 2 📏 How severe — quantify it yourself | 67 |
| 3 👥 Operate on the numbers | 40 |
| 4 🧮 Planning: measure the aorta | 28 |
| 5 🩸 Set-up: angiography before surgery | 10 |
| 6 🎬 Strategy: curves, damping, what not to do | 34 |
| 7 🛠️ Engage the left main, read the pressures | 33 |
| 8 🛏️ Back on the unit | 15 |
| 9 🚨 The night the aorta tore | 75 |
| 10 🧠 The vicious cycle | 20 |
| 11 💀 M&M war stories | 30 |
| 12 🏁 Debrief & assessment (10-question quiz) | 27 |

## Stages

1. **🚑 Presentation.** Paramedics are called at 23:20 for "pounding in the neck". BP is 168/44 with a collapsing pulse. Covers why the pulse pressure widens, the eponymous signs (useful, weak or folklore), the Austin Flint murmur vs MS, the LVH ECG, why bradycardia worsens AR, and BP management.
2. **📏 Echo.** The learner measures pressure half-time, descending-aorta end-diastolic reverse velocity and vena contracta, and calculates RVol/RF/EROA. Then three more decisions: two discordant patients and the El Khoury mechanism.
3. **👥 Heart team.** A trigger plot over 4 serial visits. The class IIb tier is met in Apr 2025 and class I now. Then: why end-systolic size, combined overload contrast, choosing repair vs mechanical vs Ross vs TAVI, and the consent conversation about valve type.
4. **🧮 Planning.** An aortic CT ruler: find the maximum, perpendicular to the centreline, which also shows how an axial slice overcalls. Then concomitant ascending replacement at ≥ 45 mm, the threshold contrast, Laplace, and the pre-op work-up.
5. **🩸 Set-up.** Pre-op coronary angiography. Checklist, sequence, and why a JL4 falls short in a dilated root.
6. **🎬 Strategy.** Branches: catheter curve (with a consequence note), damping, crossing into the LV, and declining a root aortogram.
7. **🛠️ Procedure.** Engage the left main (curve choice, test puffs, damping) and record LVEDP / aortic diastolic pressure. Then a decision on whether to graft an LAD lesion with iFR 0.94.
8. **🛏️ Back on the unit.** BP regimen while waiting, red-flag card, the heavy-lift mechanism, and what vasodilators can and cannot do.
9. **🚨 Crisis.** Day 17, 03:10: type A dissection makes the AR acute. Covers the pre-hospital bundle, why the classic signs disappear, PHT in acute AR, the diastasis pressure model and an impulse-control titrator (the beta-blocker tension). Then refusing the IABP and refusing pericardiocentesis, and an emergency Bentall with a bioprosthesis, as he chose in clinic.
10. **🧠 Cycles.** Three cycles: acute AR, silent chronic AR, bicuspid aortopathy. Two decisions.
11. **💀 M&M.** Six war stories, each with a death or near-death (IABP in endocarditic AR, metoprolol in dissection with AR, antithrombotics in a missed dissection, the letter nobody read, pericardiocentesis in dissection, quiet acute AR treated as sepsis). Three scored decisions.
12. **🏁 Debrief.** Discharge plan, 10-question quiz, score table, 10 take-home points, CaseLibrary.

## Local simulators (`sims.jsx`, written in the kit's style)

`ARAuscultation` (chronic AR + Austin Flint, acute AR, MS, normal; LSE/apex sites; sit-forward, handgrip and amyl nitrite manoeuvres; synthesised audio) · `PulseWave` (normal, collapsing, bisferiens, parvus et tardus, acute AR; arm-raise) · `PeripheralSigns` · `ARDoppler` (PHT by slope) · `AortaFlow` (normal/moderate/severe; descending vs abdominal) · `VenaContracta` · `TriggerPlot` · `AortaRuler` · `AoLVPressure` (chronic / acute) · `CoronaryEngage` · `ImpulseControl` (+ exported `impulseModel`).

## Media — and how each item was checked

**YouTube, Wikimedia Commons and direct page fetches were all blocked in this environment.** `www.youtube.com` and `commons.wikimedia.org` got a 403 from the egress proxy, and WebFetch could not resolve either host. So I could not open any video or file page, or read `ytInitialData`. Each video ID and title below came from web-search results pointing at that exact `youtube.com/watch?v=` URL. A channel is named only where the search result itself named it. Everything else shows "YouTube". **Open each one before release.**

| Stage | Video ID | Title (from search index) | Channel shown |
|---|---|---|---|
| 1 | `uZysrKXHJMM` | Aortic Regurgitation — Heart Sounds | MEDZCOOL (in the indexed title) |
| 1 | `UhnEXEpJp8c` | Aortic Regurgitation: A Common Heart Murmur, Explained | — |
| 2 | `29huxwG28gs` | The Aortic Regurgitation Illusion: From Mild-Moderate to Truly Severe | — |
| 2 | `lylBnldFLmk` | Types of aortic regurgitation based on mechanism | — |
| 3 | `ZzWwl2iobnw` | Research Alert: Ross Procedure Leads to Improved Survival Benefit… | — |
| 3 | `AUm3_onW_k4` | Valve Sparing Aortic Root Replacement w/ David V Procedure | — |
| 9 | `mbUt5vcDpGI` | Aortic Dissection — Stanford Type A vs Stanford Type B — Cardiology Series | — |
| 9 | `fUaSAx0elMM` | Aortic Dissection — Thoracic & Abdominal — Animation by Cal Shipley, M.D. | Cal Shipley, M.D. (in the indexed title) |
| 9 | `jeIzJwrDfYQ` | Acute Aortic Dissection, Stanford Type A, POCUS | — |

- **Channel searches** (`AR_SEARCHES`, `DISSECTION_SEARCHES`): `/search?query=` links on the three recommended channel handles already used in `valveMedia.js`. No video IDs.
- **Debrief CaseLibrary:** the shared `VALVE_PLAYLIST` / `VALVE_CHANNELS` from `valveMedia.js`.
- **Image:** `Pericardial_effusion_with_tamponade_(cropped).gif` (Wikimedia Commons), reused from `cath01`. I could not re-check it from here, and it fails to load inside this sandbox (blocked host). The `Figure` fallback shows a link instead. That blocked fetch is the only console error in the desktop run.
- No AR-specific Commons images were added, because none could be verified.

## For the clinical reviewer to check

- **ESC/EACTS 2025 AR triggers as used.** Class I: LVEF ≤ 50%, LVESD > 50 mm, LVESDi > 25 mm/m². IIb at low risk: LVEF ≤ 55%, LVESDi > 22 mm/m², LVESVi > 45 mL/m². These came from secondary summaries; please confirm against the recommendation table.
- **Aortic thresholds** (2024 ESC aorta guideline): ≥ 55 mm; bicuspid root phenotype ≥ 50 mm; ≥ 50–52 mm with risk factors or low risk; concomitant replacement ≥ 45 mm at valve surgery. A secondary ACC summary quoted a different bicuspid figure, so please confirm.
- **Severity criteria:** VC > 6 mm, PHT < 200 ms (supportive), holodiastolic descending-aorta reversal with end-diastolic velocity > 20 cm/s, RVol ≥ 60 mL, RF ≥ 50%, EROA ≥ 0.30 cm².
- **Impulse control in dissection with severe acute AR.** The usual target is HR ≤ 60 and SBP 100–120. The case teaches accepting about 70–90 bpm with titrated esmolol. That is a teaching judgement based on the guideline's call for caution in AR, not a guideline number. The `ImpulseControl` model is illustrative, not validated haemodynamics.
- **Prosthesis choice at 58** is framed as "mechanical usually favoured below ~60, bioprosthesis reasonable on informed preference". Check this wording against the 2025 age cut-offs.
- **Post-op antithrombotic:** low-dose aspirin, with OAC as an alternative for the first 3 months after a surgical bioprosthesis.
- **Pre-op coronary angiography** is justified by a non-diagnostic CCTA (calcium score 640). The aortogram is declined deliberately.
- **Hill's sign** is presented as largely artefact, and the Duroziez and Austin Flint signs as the useful eponyms.
- The `CoronaryEngage` geometry (JL5 for a 46-mm root) is a simplification.
