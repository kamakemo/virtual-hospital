# Case 03 — Radiation Heart Disease (`cv-valve:3`)

**Header:** Valvular & Pericardial Grand Rounds — Radiation Heart Disease: Everything the Beam Touched
**Unit / bed:** Valvular & Structural Heart Unit, bed 3 · **Deep link:** `/#case=cv-valve:3`
**Patient:** Mrs Helen Marchetti, 53, a chemistry teacher. Hodgkin lymphoma at 27 (1999) was treated with ABVD and mantle-field radiotherapy (36 Gy). Her symptoms were first labelled "HFpEF" and then "cryptogenic cirrhosis". She has calcific constrictive pericarditis, severe low-flow low-gradient AS, moderate MR with a calcified aorto-mitral curtain, ostial left main disease, a porcelain aorta, PR 220 ms with LAFB, lung fibrosis and hypothyroidism.
**Guidelines used:** 2015 ESC pericardial diseases (radical pericardiectomy), ASE/EACVI 2013 pericardial imaging, Mayo echo criteria (Welch 2014), Talreja 2008 cath criteria, 2025 ESC/EACTS VHD, 2024 ESC CCS, 2022 ESC cardio-oncology. Simplified for teaching. Where evidence is thin (which ventricle to free first, sequencing in a hostile chest), the text says so.

## Score

**Full score: 508 / 508.** Automated Playwright playthroughs got full marks at 1280×900 and 390×844 with **0 page errors**. The total matches the maximum computed independently from the source: 35 decisions = 316, multiselects 43, sequence 6, simulators (ScoreOnce) 109, board 14, quiz 20.

| Stage | Max |
|---|---|
| 1 🚑 Presentation & triage | 63 |
| 2 📏 Echo & simultaneous pressures | 94 |
| 3 👥 Grand-round heart team | 34 |
| 4 🧮 Sternotomy-risk planner | 39 |
| 5 🩸 Set-up (part one done) | 31 |
| 6 🎬 Strategy | 46 |
| 7 🛠️ Radical pericardiectomy | 38 |
| 8 🛏️ First evening in ICU | 25 |
| 9 🚨 02:40 — low output with a dilated RV | 52 |
| 10 🧠 Vicious cycles | 20 |
| 11 💀 M&M | 30 |
| 12 🏁 Survivorship, debrief, quiz | 36 |

**Ward check:** bed 3 of the Valvular & Structural Heart Unit shows the header and **Open case**, and the case opens from there.

## Stages

1. **Presentation.** The JVP/Kussmaul viewer, knock timing, the mantle-field map, an ECG (low voltage, 1° AVB, LAFB, T inversion) and bloods. Also covers the ascitic tap (high SAAG plus high protein means post-sinusoidal), the "low" NT-proBNP clue, and stopping the diuretic spiral.
2. **Measure.** The learner measures mitral E variation (with an amyloid comparison), e′ medial vs lateral (annulus reversus), hepatic vein expiratory reversal and septal M-mode, plus Doppler of the AV. Also covers low-flow AS hidden by constriction (calcium score), and simultaneous LV/RV pressures for her and an amyloid patient (calipers plus concordance call, then systolic area index). Ends with the constriction-vs-restriction board and the mixed-physiology framing.
3. **Heart team.** Transient vs chronic constriction, the indication, why a radiated chest is hostile, Bertog 2004 outcomes, the consent conversation.
4. **Planner.** Planning CT and the sternotomy-risk planner. The chosen plan is IVUS LM PCI + TF TAVI, then radical off-pump pericardiectomy at about 6 weeks on aspirin alone, with the MR left. Covers TAVI at 53 because of the porcelain aorta, 1-month DAPT (HBR), and the porcelain/radiation coronary contrast pairs.
5. **Set-up.** Part one done; why TAVI unmasks interdependence; the checklist (femoral bypass plan B); "fast, full, tight" induction; the sequence.
6. **Strategy.** Sternotomy vs thoracotomy, bypass on standby, LV first, radical extent, leaving a calcium island on the LAD.
7. **Procedure.** The pericardiectomy simulator, then pressures after release, the epicardial "waffle", and why LVEDP stays high (myocardial component).
8. **ICU.** Checks, not chasing the CVP, drug doses, the first-night mechanism, and RV failure vs tamponade.
9. **Crisis.** Night one: hypotension with a rising CVP after 2 L of fluid. Differential, echo first, then the RVRescue simulator: noradrenaline, inodilator, iNO, atrial pacing, ventilation and diuresis, with fluid, metoprolol, IABP and re-opening as traps. Vitals move. Closes with ECMO as the escalation.
10. **Cycles.** The diuretic trap, the post-pericardiectomy RV spiral and the radiation cascade, with 2 decisions.
11. **M&M.** Six stories, each with a death or near-death: HFpEF diuresis, TIPS for cardiac ascites, partial pericardiectomy, porcelain cross-clamp stroke, beta-blocker for sinus tachycardia, and no survivorship breast screening. Three scored decisions.
12. **Debrief.** Diuretics at discharge, a survivorship plan, the 10-question quiz, the score table, 11 take-home points and the CaseLibrary.

Coverage of the contract minimums: Why chains in every stage 1–9 (12 total); 12 contrast pairs; 3 vicious cycles.

## Local simulators

- `sims.jsx`:
  - `JVPViewer` (constriction / normal / restriction / tamponade, neck gauge)
  - `KnockPhono` (knock / S3 / OS, synthesised audio, A2-interval caliper)
  - `LVRVPressure` (constriction / restriction; calipers, concordance call, systolic area index)
  - `MitralInflow` (E variation with respirometer)
  - `AnnulusDoppler` (TDI e′, hepatic vein, septal M-mode)
  - `ConstrictionBoard`
- `procedures.jsx`:
  - `HeartTeamPlanner` (+ `planScore`)
  - `Pericardiectomy` (+ `scorePeri`)
  - `RVRescue` (+ `rescueState`, `rescueScore`)
- **Kit components reused:** `Doppler`, `ECG12`, `Echo` (subcostal), `BedsideMonitor`.

The haemodynamic and rescue numbers come from teaching models, not validated physiology.

## Media — and how each item was checked

**YouTube and Wikimedia Commons were blocked in this environment.** `curl https://www.youtube.com/` got a proxy 403, and WebFetch could not resolve youtube.com. So no video or image could be opened.

- **One video, not verified:** `FberAhcfNIY` — "Constrictive Pericarditis, Diagnosis and Management". It came from a web-search result pointing at that exact watch URL, and its channel is unknown, so none is named. Shown in stage 3. **Open it before release; replace it if it is wrong or poor.**
- **Channel search links** (`media.js`): `/search?query=` URLs on the three recommended channel handles (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology), for constriction, LV/RV haemodynamics, porcelain aorta TAVI and ostial left main PCI. No video IDs.
- **Debrief CaseLibrary:** the shared `VALVE_PLAYLIST` and `VALVE_CHANNELS` from `valveMedia.js`.
- **No Wikimedia images were added**, because none could be verified. The mantle-field diagram is an inline SVG drawn for this case.

## For the clinical reviewer to check

- **Constriction thresholds:**
  - Mitral E variation ≥ 25% and tricuspid ≥ 40%.
  - Mayo criteria: septal shift, medial e′ ≥ 9 cm/s, HV expiratory reversal ratio ≥ 0.79; sensitivity 87%, specificity 91%.
  - Cath: LVEDP−RVEDP ≤ 5, RVSP < 50–55, RVEDP/RVSP > ⅓, systolic area index > 1.1.
  - About 18% of proven constriction has a normal-thickness pericardium.
- **Ascites:** a SAAG ≥ 11 g/L with protein ≥ 25 g/L is presented as cardiac/post-sinusoidal. Liver stiffness is said to be inflated by congestion.
- **Bertog 2004 7-year survival** (≈ 88% idiopathic, 66% post-surgical, 27% post-radiation) is quoted from memory. Please confirm.
- **"Free the LV before the RV"** is taught as the traditional order with a physiological rationale. The text says this rests on surgical experience and that some surgeons differ. The same applies to off-pump with bypass on standby vs routine bypass.
- **Sequencing** (PCI + TAVI, then pericardiectomy at about 6 weeks on aspirin alone after 1-month DAPT) is a heart-team judgement for this anatomy, not a guideline recommendation.
- **TAVI at 53** is justified by the porcelain aorta and radiated chest. Durability and valve-in-valve planning are acknowledged.
- **The MR is left alone** (moderate, calcified curtain) and re-assessed after release. That is a judgement call.
- **Drug doses (stage 8/9):**
  - Noradrenaline 0.02–0.2 µg/kg/min.
  - Dobutamine 2.5–5 µg/kg/min.
  - Milrinone 0.25–0.5 µg/kg/min, no bolus.
  - iNO 20 ppm.
  - Amiodarone 300 mg over 1 h, then 900 mg/24 h.
- **The post-pericardiectomy low output incidence** is given as roughly 10–25%.
- **Survivorship:**
  - Breast screening from about 8 years after RT (not before 25). This is UK-style wording; please check local rules.
  - Echo screening at 5 years after RT, then every 5 years (ESC 2022 cardio-oncology).
  - Yearly TFTs, carotid duplex.
- **ABVD's doxorubicin** is named as an extra myocardial insult. That is a contributor, not proven to be the cause of her restrictive component.
- War stories are composites.
