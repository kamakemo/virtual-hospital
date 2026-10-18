# Case 03 — Radiation Heart Disease (Valvular & Pericardial Grand Rounds)

**Key** `cv-valve:3` · Valvular & Structural Heart Unit, bed 3
**Header** Valvular & Pericardial Grand Rounds — Radiation Heart Disease: Everything the Beam Touched
**Patient** Mrs Siobhan Kearney, 54 F, 71 kg (invented). Hodgkin lymphoma at 30 (2002): ABVD ×4 (doxorubicin 200 mg/m²) and mantle-field RT 36 Gy. She arrives labelled "cryptogenic cirrhosis" with ascites and oedema. She has calcific constrictive pericarditis with a mixed myocardial component, severe low-flow low-gradient AS with aorto-mitral curtain calcification, ostial RCA disease, a porcelain aorta, PR prolongation, apical lung fibrosis and radiation hypothyroidism.
**Guidelines** ESC/EACTS 2025 VHD; ESC 2025 myocarditis & pericarditis; ESC 2022 cardio-oncology; EACVI/ASE 2013 consensus on imaging after chest RT; ESC 2024 CCS (DAPT duration); the Mayo echo criteria for constriction (Welch et al., Circ Cardiovasc Imaging 2014).

## Score

**421 / 421** on a perfect run. The automated Playwright playthrough reaches full marks with **no page errors** at 1280×900 and at 390×844.

| Stage | Max |
|---|---|
| 1 🚑 The cirrhosis that wasn't | 32 |
| 2 📏 Shell, muscle or valve? — echo and catheter | 67 |
| 3 👥 Grand rounds: the heart team | 43 |
| 4 🧮 Planning: TAVI and the hostile chest | 34 |
| 5 🩸 Set-up: the morning of the pericardiectomy | 22 |
| 6 🎬 Strategy: three forks in the operation | 30 |
| 7 🛠️ The pericardiectomy | 30 |
| 8 🛏️ Back on the unit: the first evening | 35 |
| 9 🚨 23:40 — the freed ventricle fails | 40 |
| 10 🧠 The vicious cycles | 20 |
| 11 💀 M&M war stories | 40 |
| 12 🏁 Discharge, debrief & assessment (10-question quiz = 20) | 28 |

## Stages (story arc)

1. **ED 10:20.** The hepatologist notices her JVP. Observations (pulse pressure 24), the radiotherapy tattoos, the JVP/knock viewer, the AS murmur (kit), the ECG (PR 240 ms, low voltage), CXR with pericardial calcium, and ascitic SAAG/protein. Decisions: the diagnosis, cardiac vs cirrhotic ascites, what the beam caused, and stopping diuretic escalation.
2. **Days 2–4.** TTE. The learner measures mitral E respiratory variation (33%), then reviews tissue Doppler (annulus reversus/paradoxus) and hepatic veins (expiratory reversal ratio 0.86). CW Doppler of the AS, where low flow from constriction under-calls the gradient. Simultaneous LV–RV catheter pressures: classify her (discordant) and an amyloid comparison (concordant), and measure the EDPs. Then the 12-finding constriction/restriction/both board, CT/CMR, the mixed constrictive–restrictive question, and the Mayo criteria.
3. **Day 6 grand rounds.** The staged plan (ostial PCI → TF-TAVI → radical off-pump pericardiectomy, no-touch aorta), why the valve comes first, why STS/EuroSCORE under-call the risk, and two conversations: "will it cure me?" and "why did no one warn me?".
4. **Planning.** Left main 40% assessed by iFR/IVUS. TAVI with LVOT/curtain calcium (self-expanding valve, modest sizing, pacing wire). TAVI result. The sternotomy-risk planner (8 hazards). Radical vs partial pericardiectomy.
5. **Week 6 set-up.** Checklist (pads, femoral access, aspirin continued with clopidogrel held 5 days, no morning diuretic), why induction is dangerous, the induction choice, and the opening sequence.
6. **Strategy.** Three branching forks, each with a consequence note: bypass strategy, LV-before-RV order, and a calcium island over the LAD.
7. **Pericardiectomy simulator.** Five regions with findings and technique choices (island, phrenic-to-phrenic, waffle, peel). A live RV trace loses its dip-and-plateau, and CVP/CI change as regions are freed. Freeing the RV before the LV gives pulmonary oedema. Then on-table TOE and the fluid decision.
8. **ICU evening.** What to monitor, milrinone dosing (no bolus, renal adjustment), when to restart clopidogrel, levothyroxine titration, and the atrial kick.
9. **Crisis, 23:40.** Acute RV failure after pericardiectomy plus complete heart block. The vitals move, with ECG CHB and an RV echo (D-shaped LV). Tamponade vs RV failure. In the resuscitation simulator, 10 actions change BP/CVP/CI and the monitor (3 are traps: fluid, PEEP, re-opening the chest). Definitive pacing follows.
10. **Cycles** (3): the diuretic trap, the freed-RV spiral, and the slow burn of radiation; 2 decisions.
11. **M&M**: 7 war stories, every one a death or near-death. Constriction treated as cirrhosis (death), metolazone for "HFpEF" (VF, death), an anterior-strip pericardiectomy followed by a fatal redo, a clamped porcelain aorta (stroke, ventilated 3 weeks), a propofol induction (PEA arrest, hypoxic brain injury), a young survivor's ostial left main (death), and fluid for the freed RV (death). 4 are followed by scored decisions.
12. **Debrief.** Survivorship discharge plan, a 10-question quiz, the score table, 10 take-home points, and a CaseLibrary.

Counts: 9 `Why` chains (one in each of stages 1–9), 9 `Contrast` pairs, 7 `WarStory`s, 3 `ViciousCycle`s (4–5 nodes, 3–4 breaks each).

## Simulators built (`sims.jsx`, in kit style, could be promoted)

| Component | What the learner does |
|---|---|
| `JVPViewer` | Breathing, JVP (cm above the sternal angle), arterial line and PCG for constriction / tamponade / restriction / normal; Kussmaul, steep vs absent y, knock vs S3, pulsus paradoxus; synthesised audio |
| `MitralInflowResp` | Pick inspiratory/expiratory beats, caliper the E-wave, report the % variation (scored); tissue Doppler (reversus/paradoxus) and hepatic vein views |
| `LVRVCath` | Simultaneous LV/RV pressures with respirometer, 0–120 / 0–40 scales; classify concordance for her and an amyloid patient; measure the EDPs (scored) |
| `CPRCMBoard` | 12 findings sorted into constriction / restriction / both |
| `SternotomyPlanner` | 8 radiation hazards, each with a mitigation choice |
| `Pericardiectomy` | SVG heart with phrenic nerves; region order and technique; live RV trace, CVP, CI and an event log (scored 20) |
| `RVEcho` | PSAX: round LV vs D-shaped LV with a ballooned RV |
| `LowOutputResus` | 10 actions with haemodynamic effects pushed to the case monitor (scored 20) |

Kit components reused: `Auscultation`, `Doppler`, `ECG12` (PR, low voltage, CHB), `BedsideMonitor`, `Decision`, `MultiSelect`, `Sequence`, `Why`, `Contrast`, `WarStory`, `ViciousCycle`, `Quiz`, `Video`, `CaseLibrary`.

## Media — ⚠️ network restriction

**YouTube and Wikimedia Commons were blocked from this build environment.** `curl` to youtube.com got a proxy 403 on CONNECT, and WebFetch could not resolve the hosts; noembed failed the same way. I could not open any video page, read `ytInitialData`, or check any Commons file.

- **No Wikimedia images were used.** All imaging is drawn on canvas/SVG.
- **Videos** were found only through a web-search index, which returned these `youtube.com/watch?v=` URLs with titles. **Every channel is UNVERIFIED**, and the case shows the channel as "YouTube — channel not verified (see REPORT.md)":

| Where | ID | Title (from search index) | Claimed source | Status |
|---|---|---|---|---|
| Stage 1 | `boqyJ8L63fw` | Constrictive Pericarditis | Search summary said Mayo Clinic | **Unverified** |
| Stage 2 | `jZfGxhb9A6U` | Pericardial Diseases II: Constrictive Pericarditis | Search summary said Mayo Clinic Echo 2024 | **Unverified** |
| Stage 2 | `Ty0ucFCRiHs` | Hemodynamics: Constrictive pericarditis cases, mechanisms, technical tips — Elias Hanna, Univ of Iowa | Title names the speaker | **Unverified** |
| Stage 9 | `smxiajBSLI4` | Cardiac tamponade Vs Constrictive Pericarditis Vs Restrictive Cardiomyopathy | Unknown | **Unverified** |
| Stage 12 | `5_EkVuMeNRA` | Pericardial Knock in Constrictive Pericarditis | Unknown | **Unverified** |

- **Channel searches** (stage 7, `RADIATION_SEARCHES`) are `/search?query=` URLs on the three recommended channel handles already used in `src/cases/valveMedia.js`. They are search pages, not individual videos.
- The final `CaseLibrary` uses the shared `VALVE_PLAYLIST` / `VALVE_CHANNELS`.

**Reviewer:** open all five IDs on a network with YouTube access. Confirm each title and channel, then replace the `channel` text with the real channel name, or remove the video if it is wrong. Ideally add a pericardiectomy or porcelain-aorta TAVI video from a recommended channel; I couldn't search them.

## Things a clinical reviewer should check

1. **Outcome figures.** Radiation pericardiectomy is described as having the worst long-term results of any cause. The quoted "7-year survival about 27%" (Bertog et al., JACC 2004) is offered as an "acceptable" option, not the best answer. Operative mortality is given as "often 10–20% in older series", and "about one in ten here" is put in the surgeon's mouth. Check these against current series and local data.
2. **"Roughly double the long-term mortality"** after cardiac surgery in irradiated patients (Cleveland Clinic matched cohort, Wu/Desai et al.). This is paraphrased, so check the wording.
3. **Staging and order** (PCI → TAVI → pericardiectomy, TAVI first). The case says the evidence is thin and the rationale is haemodynamic. Combined surgery scores as "acceptable" (4/10). Heart teams may legitimately differ.
4. **Numerical thresholds:** mitral E variation ≥ 25%; Mayo criteria (septal shift + medial e′ ≥ 9 cm/s or hepatic vein expiratory reversal ratio ≥ 0.79); RVEDP/RVSP > 1/3; RVSP < 55; EDP difference ≤ 5; systolic area index > 1.1; a normal-thickness pericardium in "about 1 in 5"; AS calcium score ≥ 1,600 AU in women (highly likely severe); SAAG ≥ 11 g/L with protein ≥ 25 g/L for cardiac ascites.
5. **Drug doses:** milrinone 0.25–0.5 µg/kg/min without a bolus, renally adjusted (0.375 in the crisis); noradrenaline 0.05–0.1 µg/kg/min; iNO 20 ppm; levothyroxine 25 µg, titrated every 4–6 weeks; clopidogrel held 5 days pre-op with aspirin continued, restarted at 24–48 h, 6 months of DAPT after elective PCI (ESC 2024); aspirin alone after TAVI.
6. **TAVI choice.** A self-expanding valve is "best" because of LVOT calcium and conduction risk, with balloon-expandable called defensible in the text. This is a judgement call.
7. **Survivorship surveillance** is phrased loosely: "echo from about 5–10 years after treatment and repeated around every 5 years, ischaemia testing if high risk". Check this against the exact ESC 2022 cardio-oncology wording.
8. **The haemodynamic model in the simulators** is schematic: waveforms are drawn to teach patterns, not to be quantitatively exact. The knock and S3 audio are synthesised.
9. **"LV first" during pericardiectomy** is taught as the rule. It is the classical teaching, but not every surgeon holds to it strictly.
10. **Kit tiles** (Contrast, Fluoro, ACT) show in the vitals strip as in every case. They read 0 here because the procedures are not contrast-tracked.
11. **Commit attribution.** The contract quotes a different session URL in its footer. I used this session's URL as the system's attribution rules require.

## Files

- `index.jsx` — the case (12 stages, `VALVE_03` definition)
- `sims.jsx` — the local simulators listed above
- `meta.js` — key and bed header
- `REPORT.md` — this file

No kit, registry, hospital, App or CSS files were touched.

## Verification done

- `npx vite build` passes.
- Playwright playthrough (`/#case=cv-valve:3`): every stage visited, every decision answered correctly, every simulator run. The result is 421/421 with no page errors, at 1280×900 and at 390×844. Screenshots of the cover, every canvas simulator, the planner, the pericardiectomy and the crisis were checked at both sizes. Phone-width layouts of the JVP, Doppler and catheter canvases were adjusted after the first review.
- 3D ward: lift → floor 05 Valvular & Structural Heart Unit → bed 3. The bed tag, bed board and bed bar show the header; **Open case** opens the case cover. No page errors.
- Note: the 3D ward draws a generic patient model on every bed (it is male here); the case patient is a woman. That is the shared hospital asset, not part of this case.
