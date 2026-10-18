# Case 08 — Severe Functional Tricuspid Regurgitation in Pulmonary Hypertension

**Key:** `cv-valve:8` · Valvular & Structural Heart Unit (Cardiology wing, floor 05), bed 8
**Header:** Severe Functional Tricuspid Regurgitation in Pulmonary Hypertension — The Forgotten Valve & the RV That Needed Its Leak
**Patient:** Mrs Elena Marchetti, 74 F. Permanent AF for 12 years, HFpEF, a VVI pacemaker lead across the tricuspid valve. Referred by hepatology as "cryptogenic cirrhosis". She has ascites, leg oedema, early satiety, a bilirubin of 38 and a creatinine rising from venous congestion.
**Score total (perfect run):** **357 / 357**

## Stages

| # | Stage | What happens | Points |
|---|---|---|---|
| 1 | 🚑 The liver that pulses | Paramedic decision: no GTN or CPAP in right-heart failure. Observations and exam. **JVPViewer** (normal / AF / her giant cv wave, with the pulsatile liver; she times the wave against the carotid). ECG12 (AF). Bloods, ascitic SAAG and protein, FibroScan trap. Diagnosis. Decongestion bundle. 2-hour urine sodium → double the loop dose | 49 |
| 2 | 📏 Echo: the velocity that lies | Echo table. **TRDopplerLab**: slide EROA and watch Vmax fall, then measure hers (2.2 m/s → echo PASP 34 vs catheter 52). **TRQuantify**: vena contracta 15 mm and PISA r 1.06 cm → EROA 90 mm², graded on the five-grade scale. Severity criteria. Mechanism (atrial vs ventricular functional TR, lead-associated). **RVPACoupling**: TAPSE/PASP with the echo vs the catheter PASP | 38 |
| 3 | 👥 RHC, risk & heart team | **RHCLab**: pull back PAWP/PA/RV/RA, read the means, choose Fick over thermodilution → PVR 1.9 WU, isolated post-capillary PH. **TriScore** (she scores 7). T-TEER vs TTVR vs surgery vs medical therapy. Communication: quality of life, not proven survival | 42 |
| 4 | 🧮 Planning | **TherapyPlanner** (T-TEER vs TTVR suitability; three presets, scored on the lead-pinned case → TTVR). 3D TOE gap table. First-clip site. Pacemaker work-up | 24 |
| 5 | 🩸 Set-up | Checklist (RV-safe anaesthesia), procedure `Sequence` | 11 |
| 6 | 🎬 Strategy | Procedural goal (≤ moderate TR, low gradient, lead free), what to check before release | 16 |
| 7 | 🛠️ T-TEER | **TricuspidClip**: en-face sites (A–S central, A–S commissural, P–S beside the lead, A–P 10 mm gap). Residual TR, gradient, RA v-wave, hepatic veins and lead status. Scored 20. Then decline a third clip | 30 |
| 8 | 🛏️ Back on the unit | Post-procedure checks (opioid trap), apixaban dose, HFpEF therapy (SGLT2i, MRA; rhythm control too late) | 20 |
| 9 | 🚨 Crisis | 23:40: opioid hypoventilation plus afterload mismatch → RV failure (vitals move). Echo and subcostal view to exclude effusion. Diagnosis. **RVResusBoard** (noradrenaline → O₂/CO₂ → dobutamine → iNO; fluid, GTN, propofol intubation and metoprolol are traps, each with a consequence; the RSI causes a peri-intubation arrest). Scored 20. Then decongestion once MAP is protected | 40 |
| 10 | 🧠 Vicious cycle | 3 cycles (TR begets TR; cardio-hepato-renal congestion; RV ischaemia spiral) + 2 decisions | 20 |
| 11 | 💀 M&M | 6 war stories, all deaths or near-deaths (TIPS, metolazone arrest, clip in pre-capillary PH, GTN in RV infarct, missed lead-induced TR, propofol into a failing RV). 4 scored decisions | 40 |
| 12 | 🏁 Debrief | Discharge plan, 10-question quiz, score table, 10 take-home points, CaseLibrary | 27 |

Kit counts: 10 `Why` chains (at least one in every stage 1–9), 11 `Contrast` pairs, 3 `ViciousCycle`s, 6 `WarStory`s.

## Simulators built (`sims.jsx`, kit style: `useCanvas`, SVG and `cs-*` classes)

- `JVPViewer` — ECG, JVP and carotid traces with irregular AF R–R intervals. Normal a-c-x-v-y vs AF vs the ventricularised cv wave. A right-upper-quadrant panel shows the liver expanding in systole. The learner times her wave against the carotid.
- `TRDopplerLab` — CW TR envelope driven by EROA. The RA v-wave rises as the leak grows (`raV = 12 + 23·EROA`) against a fixed RV systolic pressure of 52, so the velocity falls and the envelope becomes dense and triangular. The learner measures her jet.
- `TRQuantify` — RV-focused apical colour view with the lead, PISA shells and a laminar jet. Two calipers (VC and PISA radius) and live five-grade classification.
- `RVPACoupling` — SVG plot of TAPSE against PASP with 0.31 and 0.40 lines, comparing the echo PASP with the catheter PASP.
- `RHCLab` — pressure traces for PAWP, PA, RV and RA in AF, with respiratory variation. Sliders for mPAP and PAWP, a choice between thermodilution and Fick output, TPG, PVR and the ESC/ERS 2022 class.
- `TriScore` — the eight TRI-SCORE items with their points (1/1/2/2/2/2/1/1), total and risk band.
- `TherapyPlanner` — feature-by-feature T-TEER vs TTVR suitability with presets. Thresholds are schematic.
- `TricuspidClip` — SVG en-face (atrial) valve with aorta, coronary sinus and lead landmarks. Grasp, insertion check, release, residual TR, gradient, RA pressure, hepatic veins and lead status.
- `RVResusBoard` — MAP, CVP, CI, SpO₂/PaCO₂ and lactate respond to each action and its order, and are mirrored to the case monitor through `setVitals`.

Reused from the kit: `ECG12` (AF), `BedsideMonitor`, `Echo` (subcostal, no effusion).

## Media — and how each was verified

**YouTube and Wikimedia Commons are blocked from this environment** (`curl https://www.youtube.com/` → proxy 403; WebFetch → ENOTFOUND for youtube.com and commons.wikimedia.org). Every link below was found through a web-search index result giving the title and the youtube.com/commons URL. None could be opened here, and **no channel name could be confirmed**, so each `Video` uses the default "YouTube" channel label. **Reviewer: please open each one.**

| Video ID | Title used | Index title it was matched to | Used in |
|---|---|---|---|
| `JVfn0JEpuLE` | NEJM — Giant CV waves of tricuspid regurgitation | "NEJM — Giant CV Waves of Tricuspid Regurgitation - YouTube" | s1 |
| `QQ802snkXGg` | Lancisi's sign (CV fusion) of severe tricuspid regurgitation | "Lancisi's Sign (CV Fusion) of Severe Tricuspid Regurgitation - YouTube" | s1 |
| `EnNbKyOaHZI` | Tricuspid regurgitation murmur — description, causes, pathophysiology | "Tricuspid regurgitation murmur - description, causes, pathophysiology - YouTube" | s1, debrief |
| `AcrqItAKFYs` | TriClip G4 TEER: advanced tricuspid valve repair | "TriClip G4 TEER: Advanced Tricuspid Valve Repair - YouTube" | s7 |
| `6WoDSfIpGCE` | EVOQUE tricuspid valve replacement system | "EVOQUE Tricuspid Valve Replacement System" (youtube.com/watch) | s4 |

The recommended channels (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology) could not be searched. The case links to them through channel-search URLs (`TRICUSPID_SEARCHES` in `index.jsx`: tricuspid, TriClip, EVOQUE), through `VALVE_CHANNELS` and through the shared playlist from `valveMedia.js`. The search URLs are built from the channel handles in the contract; they were not opened.

Images (Wikimedia Commons, file pages found through the search index; the licence could not be read, so the credit says "see file page for licence"):
- `File:JVP_waveform.png` — normal JVP waveform (s1)
- `File:Diagram_of_the_human_heart_(cropped).svg` — the index snippet described it as CC0 (s2)

## Testing

- `npx vite build` — passes.
- Playwright playthrough at 1280×900 and 390×844 (`playwright-core`, Chromium 1194, swiftshader): every stage, every decision best, every simulator run. **357/357, no page errors.** The only console errors are blocked network loads (Google Fonts and Wikimedia images through the proxy).
- Screenshots checked: cover, JVP viewer, TR Doppler (mild and hers), TR quantification, coupling plot, RHC, TRI-SCORE, planner, en-face clip, crisis monitor and board, cycle, score table. Fixed after review: the hero title was too long; the echo chambers were drawn off the canvas; the clip sites and lead were not on their coaptation lines; the en-face panel stretched.
- 3D ward: Cardiology → floor 05 → Bed 08. The bed board shows the header, and **Open case** opens the case.

## For the clinical reviewer

1. **Guideline class for transcatheter TV intervention** — the text says ESC/EACTS 2025 "supports" transcatheter treatment of symptomatic severe secondary TR in patients unsuitable for surgery at a heart valve centre. Please confirm the class and wording against the 2025 document.
2. **Five-grade TR scale** (Hahn & Zamorano): VC < 3 / 3–6.9 / 7–13 / 14–20 / ≥ 21 mm; PISA EROA < 20 / 20–39 / 40–59 / 60–79 / ≥ 80 mm². The 3D VCA value of 1.6 cm² is described as torrential.
3. **TRI-SCORE** weights as implemented: age ≥ 70 (1), NYHA III–IV (1), RHF signs (2), furosemide ≥ 125 mg/day (2), GFR < 30 (2), raised bilirubin (2), LVEF < 60% (1), moderate/severe RV dysfunction (1). The bands are ≤ 3, 4–5 and ≥ 6, and mortality is quoted only as "0% → ~60% at ≥ 9". Please check the weights and bands against Dreyfus 2022.
4. **RV–PA coupling cut-offs** (0.31 and 0.40 mm/mmHg) are presented as prognostic markers, not guideline thresholds.
5. **Haemodynamics** — ESC/ERS 2022 definitions (mPAP > 20; PAWP > 15; PVR > 2 WU). Thermodilution is said to under-read in her case. The direction of the error in severe TR is variable, and the text says "unreliable". Fick: 195 ÷ (13.4 × 11.8 × 0.29) ≈ 4.2 L/min.
6. **Diuretics** — IV loop at 1–2× the oral daily dose. A 2-hour spot urine Na < 50–70 mmol/L or < 100–150 mL/h means double the dose (ESC 2021). ADVOR and CLOROTIC are named for sequential blockade. The statement that albumin with paracentesis is "not routinely needed" in cardiac ascites is practice-based.
7. **Trial figures** — TRILUMINATE: TR ≤ moderate ~87% at 1 year, QoL benefit, no difference in death or HF hospitalisation at 1 year. TRISCEND II: new pacemaker "~1 in 6 to 1 in 4" (trial vs real-world).
8. **RV resuscitation** — noradrenaline first, then dobutamine, inhaled NO 20 ppm (with a caution about wedge pressure in post-capillary PH), and avoid intubation (ketamine/etomidate if unavoidable). Doses are typical starting ranges.
9. **Apixaban** — she meets one criterion (weight 55 kg ≤ 60), so the full dose stands.
10. **Simulators are schematic**: the RA v-wave model, clip EROA reductions, gradient increments and the planner thresholds exist to teach, not to match any device IFU.

## Attribution note

The commit uses the session footer from this session's instructions. `docs/CASE_CONTRACT.md` quotes a different `Claude-Session` URL.
