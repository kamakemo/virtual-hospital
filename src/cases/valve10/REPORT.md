# Case 10 — Pulmonary Valve Stenosis (`cv-valve:10`)

**Header:** Pulmonary Valve Stenosis — the Click that Vanishes and the Suicide Right Ventricle
**Unit / bed:** Valvular & Structural Heart Unit, bed 10 · **Deep link:** `/#case=cv-valve:10`
**Patient:** Ms Yasmin Darwish, 24, primary-school PE teacher. Exertional presyncope, Noonan features (short stature, hypertelorism, webbed neck, pectus, a brother operated on as a baby), and plans to get pregnant this year. Severe doming valvular PS: 4.4 m/s, peak 77 / mean 39 mmHg, annulus 20 mm.
**Guidelines used:** 2020 ESC adult congenital heart disease (primary), with 2018 AHA/ACC ACHD where they differ. Also EAE/ASE valve stenosis echo recommendations, the 2018 ESC cardiovascular disease in pregnancy guideline and the 2023 ESC endocarditis guideline.

## Score

**Full score: 410 / 410.** An automated Playwright playthrough got full marks at 1280×900 and at 390×844, with no page errors and no console errors.

| Stage | Max |
|---|---|
| 1 🚑 She went grey on the playground | 39 |
| 2 📏 Measure it — Doppler, RVSP and the level | 50 |
| 3 👥 The ACHD heart team | 45 |
| 4 🧮 Planning: size the balloon | 45 |
| 5 🩸 Set-up in the cath lab | 12 |
| 6 🎬 Strategy: the waist, the squirt, the residual gradient | 40 |
| 7 🛠️ Balloon pulmonary valvuloplasty | 30 |
| 8 🛏️ Back on the unit | 17 |
| 9 🚨 The suicide right ventricle | 45 |
| 10 🧠 The vicious cycle | 20 |
| 11 💀 M&M war stories | 40 |
| 12 🏁 Discharge, debrief & assessment | 27 |

Totals in the file: 12 `Why` chains (at least one in each of stages 1–9), 12 `Contrast` pairs, 3 `ViciousCycle`s with 2 decisions, and 6 `WarStory`s, each with a death or near-death and 4 followed by a scored decision. There are 26 decisions, 9 multi-selects, 1 sequence and a 10-question quiz. Scored simulators: Doppler 15, balloon sizer 15, valvuloplasty 20, suicide-RV board 20.

The 3D ward was checked with Playwright (lift → floor 05 Valvular & Structural Heart Unit → bed 10). The bed board and bed bar show the header, and **Open case** opens the case.

## Stages

1. **🚑 Presentation.** Exertional presyncope on the playground. Covers the auscultation simulator, why the click vanishes on inspiration, contrasting the pulmonary click with the aortic click and the moving split with the fixed ASD split, and an RVH/RAD ECG with a normal ECG toggle. Also Noonan features, refusing the "vasovagal" discharge, why exertional syncope happens, and safe first steps (no GTN, no diuretic, keep her filled, coagulation screen).
2. **📏 Echo.** The learner measures PS and TR peak velocities on CW Doppler and picks RAP from the IVC. The simulator calculates peak and mean gradient, RVSP and PASP (= RVSP − PS gradient). The stage continues with "is this pulmonary hypertension?" (no), grading, and the level of obstruction. Contrasts cover valvular vs infundibular (dagger), valvular vs supravalvular/branch, and post-stenotic vs PH dilation. It ends with a discordant high-flow case (pregnancy + ASD) and why Doppler gradients exceed catheter gradients.
3. **👥 Heart team.** ESC 2020 indication, balloon vs surgery, and doming vs dysplastic valve. Also covers the Noonan work-up (LV/HCM, coagulation, genetics, branch PAs; karyotype is the distractor), PS with intact septum vs tetralogy physiology, the "pregnancy first?" conversation, PS vs MS in pregnancy, and consent.
4. **🧮 Planning.** Where to measure the annulus, and the 1.2–1.4 balloon-to-annulus ratio (BAR) mechanism. The learner uses the **BalloonSizer** (lateral RV angiogram; three measuring levels, calipers, balloon choice, BAR). Then wire position and double-balloon sizing for a large annulus.
5. **🩸 Set-up.** Checklist (fluids on, esmolol and phenylephrine ready; a primed dobutamine is the distractor), a procedure sequence, and why inflations must be short.
6. **🎬 Strategy.** Four branches: a persistent waist, the balloon squirting, bradycardia during inflation, and a residual infundibular gradient. Includes the "leave it vs chase it" contrast and why relief can make the infundibulum angrier.
7. **🛠️ Procedure.** Pre and post pull-back traces, and the **Valvuloplasty** fluoroscopy simulator: positioning, hold-to-inflate, the waist appearing and popping, melon-seeding if off-centre, and live BP fall and bradycardia if the inflation is held too long. Then reading the post pull-back by level, and Doppler vs catheter gradients.
8. **🛏️ Back on the unit.** Fluids and anti-emetic (ondansetron), checks, no endocarditis prophylaxis, why dehydration matters today, and early vs late pulmonary regurgitation.
9. **🚨 Crisis.** At 13:40 she has vomited and is fasting: BP 76/48, HR 128, and the FY2 is drawing up dobutamine. Echo shows a dagger-shaped infundibular jet. The learner makes the diagnosis and stops the dobutamine, then works the **SuicideRV** resuscitation board: fluids, legs up, esmolol and phenylephrine help; dobutamine, adrenaline, GTN and furosemide worsen the gradient and can cause a PEA arrest. Vitals move live. Includes why inotropes kill and the suicide RV vs failing ventricle contrast.
10. **🧠 Cycles.** The suicide-RV spiral, the exertional pressure-loaded RV, and late PR. Decisions on phenylephrine and on vasodilators.
11. **💀 M&M.** The dobutamine drip (PEA, near-death); the 33-mm balloon (annular tear, tamponade); the Noonan heart nobody scanned (HCM arrest at induction); "vasovagal" (VF on the pitch, hypoxic brain injury); "pulmonary hypertension" (sildenafil for PS, syncope with BP 70/40); the pregnancy that came first (RV failure, valvuloplasty at 28 weeks, emergency caesarean at 31).
12. **🏁 Debrief.** Discharge plan, 10-question quiz, score table, 10 take-home points, and a CaseLibrary (PS searches plus the shared valve playlist and channels).

## Local simulators (`sims.jsx`, written in the kit's style)

- `PSAuscultation`: lesions are her doming PS, mild PS, dysplastic (Noonan, no click), bicuspid AS (click unchanged by breathing), ASD (fixed split) and normal. It has expiration / inspiration / auto-breathe controls, pulmonary and aortic sites, phonocardiogram + ECG + JVP (giant a-wave), synthesised audio, and readouts for click, split, murmur end and a-wave.
- `PSDoppler`: PS jet, TR jet and an infundibular "dagger" comparison. Velocity caliper, IVC → RAP choice, and calculated peak/mean gradient, RVSP and PASP. Exports `meanGradient`.
- `BalloonSizer`: lateral RV angiogram with a calibration catheter, hinge/sinus/dome levels, calipers and balloon chips showing BAR.
- `Valvuloplasty`: fluoroscopy, balloon position, hold-to-inflate, waist and pop, melon-seeding, an inflation timer driving `setVitals`, and an inflation log.
- `PullbackTrace`: PA → RV pull-back before and after, with the infundibular step.
- `SuicideRV`: an illustrative model (`suicideModel`) of preload, rate, contractility and tone → infundibular gradient and systemic BP. It has eight orders, an arrest-and-rescue path, and drives `setVitals`.

Kit components reused: `ECG12` (custom RVH shape), `BedsideMonitor` and all the teaching components.

## Media — and how each item was checked

**YouTube, Wikimedia Commons and Wikipedia could not be reached from this environment.** The egress proxy returned 403 for `www.youtube.com` and `commons.wikimedia.org`, and WebFetch could not resolve Commons or Wikipedia. I could not open any video page or read `ytInitialData`. Every video ID below came from web-search results that pointed at that exact `youtube.com/watch?v=` URL. **None is verified. Open each one before release.** Channels are named only where the search snippet named them.

| Stage | Video ID | Title (as indexed) | Channel shown |
|---|---|---|---|
| 1 | `Hc7srdrxyw8` | Pulmonary Stenosis (snippet: animations credited to Children's Heart Surgery Fund) | — |
| 1 | `VE_oh1aiLBU` | Pulmonic Stenosis (PS) — Pulmonic Valve Stenosis — Valvular Heart Disease — Cardiology | — |
| 2 | `wpXHupCtaIk` | Infundibular and subvalvular stenosis types of pulmonary stenosis | — |
| 2 | `pnYoVUdnBU0` | Supravalvular Pulmonary Stenosis / Estenose Supravalvular Pulmonar | — |
| 3 | `E5tDGYVga9I` | Pulmonary Stenosis: Surgical Correction | Texas Children's Heart Center (per search index) |
| 4 | `iA3M-lkjf7Q` | Percutaneous transluminal balloon pulmonary valvuloplasty (PBPV), AIIMS Bhubaneswar | AIIMS Bhubaneswar (per search index) |
| 4 | `btGBgIJEH2U` | Sequential balloon valvuloplasty in a near-atretic pulmonary stenosis | — |
| 7 | `SwpoXbQI3Oo` | Balloon Pulmonary Valvuloplasty: an uncommon procedure … at Swagat Hospital | — |
| 7 | `sCBucOkNssk` | Pulmonary stenosis — clinical findings, investigation, treatment | — |
| 9 | `7l1IAEeYBr4` | Pulmonary regurgitation & stenosis | — |

None of the recommended channels (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology) came up in search for pulmonary valvuloplasty. They appear only as channel **search links** (`PS_SEARCHES` in `index.jsx`), which contain no video IDs. The debrief CaseLibrary uses the shared `VALVE_PLAYLIST` and `VALVE_CHANNELS` from `valveMedia.js`.

**Images:** none. No Commons file could be verified, so none was added rather than guessing filenames.

## For the clinical reviewer to check

- **ESC 2020 ACHD RVOTO recommendations as taught:**
  - Class I: intervention at any level regardless of symptoms when the peak Doppler gradient is > 64 mmHg, provided no valve replacement is needed.
  - Class I: balloon valvuloplasty for suitable valvular PS.
  - IIa: below 64 mmHg, consider intervention for symptoms, decreased RV function, arrhythmia or right-to-left shunting.

  These were written from memory and secondary sources; please confirm the classes and wording. The AHA/ACC 2018 summary in the `s3-ind` rationale is paraphrased.
- **Severity grading:** mild < 3 m/s (< 36 mmHg), moderate 3–4 m/s (36–64 mmHg), severe > 4 m/s (> 64 mmHg). "Mean gradient > ~35–40 mmHg supports severe" is a teaching statement, not a guideline cut-off.
- **Balloon-to-annulus ratio of 1.2–1.4, and never > 1.5.** Paediatric statements favour 1.2–1.25; adult series use up to 1.4. The double-balloon effective diameter is simplified to "≈ 0.8 × the sum".
- **Heparin dose:** ~100 U/kg (5,000 U for 52 kg) is a common practice figure. Some labs use 50–100 U/kg.
- **Suicide RV treatment:** volume, beta-blockade (esmolol/propranolol) and phenylephrine; no inotropes, vasodilators or diuretics. Oral propranolol "for weeks to months" afterwards is common practice, not a guideline recommendation. The `SuicideRV` model is illustrative, not validated haemodynamics.
- **Doppler pitfalls:** peak instantaneous > catheter peak-to-peak, pressure recovery, tandem lesions, high-flow overestimation and low-flow underestimation.
- **Noonan:** PS in about half to 60%, HCM in up to ~20%, bleeding diatheses, autosomal dominant inheritance with PTPN11 in about half. The case keeps the genetic result pending.
- **Pregnancy:** relieve severe PS before conception, following the ESC pregnancy guideline. The case cites the 2018 version; please check it against any newer update.
- **Endocarditis:** no prophylaxis after balloon valvuloplasty of a native valve (ESC 2023).
- **Sport after relief:** "all sports once the infundibular gradient has settled, with mild residual PS". Please check this against the ESC 2020 sports cardiology guideline.
- **The click's response to respiration:** one secondary source (Merck/MSD) states the opposite. The case follows the classic teaching (ACP/NCBI): the click softens or disappears on inspiration.
