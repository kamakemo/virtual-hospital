# Case 07 — Right-Sided Infective Endocarditis

**Key** `cv-valve:7` · Valvular & Structural Heart Unit, bed 7
**Header** Right-Sided Infective Endocarditis — Septic Lungs, a Vegetation & the Person Behind the Valve
**Patient** Ms Jade Morrison, 24 F, 52 kg (invented). Injects heroin/cocaine into her right groin; HCV antibody positive; MSSA tricuspid endocarditis with cavitating septic pulmonary emboli.
**Guidelines** ESC 2023 endocarditis (with the 2023 Duke-ISCID criteria), the POET trial, ATLS 10th edition (needle decompression), BTS pleural guidance.

## Score

**369 / 369** on a perfect run. The automated Playwright playthrough reaches full marks with **no page errors** at 1280×900 and at 390×844.

| Stage | Max |
|---|---|
| 1 🚑 Fever, cough and holes in the lungs | 38 |
| 2 📏 Cultures, Duke criteria and the vegetation | 37 |
| 3 👥 The endocarditis team: still positive on day 6 | 26 |
| 4 🧮 Planning: the prescription and the route | 36 |
| 5 🩸 Set-up in the hybrid lab | 12 |
| 6 🎬 Strategy: how much to take, and when to stop | 25 |
| 7 🌀 Percutaneous aspiration of the vegetation | 38 |
| 8 🛏️ Back on the unit | 39 |
| 9 🚨 Day 9, 03:10: the lung gives way | 30 |
| 10 🧠 The vicious cycles | 20 |
| 11 💀 M&M war stories | 40 |
| 12 🏁 Discharge, debrief & assessment (10-question quiz = 20) | 28 |

## Stages (story arc)

1. **ED 02:15** — rigors, cough, pleuritic pain, groin injecting, giant cv-waves, a TR murmur, CXR with cavitating nodules. Covers cultures before antibiotics, empirical flucloxacillin + vancomycin, cautious fluids, and treating opioid withdrawal from hour 1.
2. **Days 1–3** — blood cultures flag (time to positivity), blood-culture technique (Sequence), the CT scroll, TTE, a Duke-ISCID builder, TTE vs TOE, and measuring the vegetation on TOE (24 mm). Ends with vegetation mimics.
3. **Day 6, endocarditis team** — persistent bacteraemia, new emboli, ESC 2023 right-sided indications, aspiration vs surgery, and consent. Contrasts person-first care with punitive care.
4. **Planning** — antibiotic plan builder (MSSA β-lactam, no gentamicin or rifampicin, 4–6 weeks from the first negative culture, POET step-down), the rifampicin–methadone interaction, jugular access avoiding the infected groin, and the RA pressure trace.
5. **Set-up** — checklist (TOE, bubble study, perfusionist, ACT, blood, surgical backup), Sequence, and why a PFO matters.
6. **Strategy** — debulk, don't chase; a fragment that embolises; when to stop.
7. **Aspiration simulator** — steer the funnel cannula on TOE (advance/deflect) and suction only when engaged. Partial contact embolises fragments; touching the leaflet injures it. Then vegetation tissue to microbiology and the plan after aspiration.
8. **Back on the unit** — surveillance-culture planner (when to repeat cultures; the clock starts at the first negative), flucloxacillin dose, PICC in PWID, monitoring, OAT, and analgesia for someone on methadone.
9. **Crisis, day 9 03:10** — tension pyopneumothorax from a ruptured septic infarct. Vitals move. Lung ultrasound (sliding / seashore / barcode), tension pneumothorax vs massive PE, decompression at the 4th/5th ICS anterior to the mid-axillary line, then a drain that returns pus (empyema).
10. **Cycles** — three: the seeding loop, the tricuspid/RV spiral, and the stigma spiral, with 2 decisions.
11. **M&M** — 6 war stories, all deaths or near-deaths: missed mitral involvement on a 2-week course (stroke, death); delayed source control (death); self-discharge with no plan (death); rifampicin halving methadone (overdose, death); an X-ray before decompression (PEA arrest, hypoxic brain injury); vancomycin continued for MSSA (death). 4 are followed by scored decisions.
12. **Debrief** — discharge plan (OAT, naloxone, harm reduction, HCV treatment, follow-up, dental prophylaxis), a 10-question quiz, the score table, 10 take-home points, and a CaseLibrary.

Counts: 12 `Why` chains (at least one in each of stages 1–9), 10 `Contrast` pairs, 6 `WarStory`s, 3 `ViciousCycle`s (4–5 nodes, 4 breaks each).

## Simulators built (`sims.jsx`, kit style, could be promoted to the kit)

| Component | What the learner does |
|---|---|
| `TRMurmur` | Phonocardiogram, breathing and JVP; murmur louder on inspiration (Carvallo) vs MR; synthesised audio |
| `CultureIncubator` | Scrub 0–48 h; 6/6 bottles flag at 11–15 h; Gram stain and MSSA identification |
| `DukeBuilder` | Call 10 findings major/minor/none; minor criteria tallied by category; live classification |
| `VegetationTOE` | Live/freeze cine, frame scrub, caliper; scored for the longest frame (24 ± 2 mm) |
| `ChestCT` | Scroll 5 axial slices of cavitating septic emboli with feeding vessels |
| `AntibioticPlanner` | Backbone, add-on, duration, oral plan; 16 points |
| `CultureCourse` | Choose surveillance days, reveal results, mark day 1 of therapy |
| `RAPressure` | Normal vs severe TR (ventricularised cv-wave) vs after debulking |
| `VegAspiration` | Steer, engage and suction; residual size, emboli, leaflet injury; 20 points |
| `LungUltrasound` | Right/left × B-/M-mode: sliding vs none, seashore vs barcode |

Kit components reused: `BedsideMonitor`, `ECG12`, `Decision`, `MultiSelect`, `Sequence`, `Why`, `Contrast`, `WarStory`, `ViciousCycle`, `Quiz`, `Video`, `CaseLibrary`.

## Media — ⚠️ network restriction

**YouTube (`www.youtube.com`, `youtube-nocookie`, `i.ytimg`) and Wikimedia Commons were blocked from this build environment** (the egress proxy returned 403 on CONNECT; WebFetch could not resolve the hosts). I could not open any video page or `ytInitialData`, or check any Commons file. Instead:

- **No Wikimedia images were used.** The imaging is drawn on canvas instead (TOE, CT, lung ultrasound, pressure traces).
- **Videos** were checked only through search-engine indexes, which returned the exact `youtube.com/watch?v=<id>` URL with its title:

| Where | ID | Title | Channel | Verification |
|---|---|---|---|---|
| Stage 1 | `SCwm5k8ULGk` | Infective Endocarditis, Animation | Alila Medical Media | Search result gave the URL and title. Alila's own site lists the same narrated "Infective endocarditis" animation. Channel name not seen on the YouTube page itself. |
| Stage 2 | `nF13Y58p5_8` | Echocardiogram in tricuspid valve endocarditis | **not verified** (shows "YouTube") | Search result gave the URL, title and description (vegetation, clearance after antibiotics, flail septal leaflet). Channel unknown. |
| Stage 12 | `iaO8110iSzI` | Infective Endocarditis | Ninja Nerd | Search result gave the URL; the search summary identified it as the Ninja Nerd lecture. |

- **Channel searches** (`ENDO_SEARCHES` in stage 7) are search URLs on the three recommended channel handles already used in `src/cases/valveMedia.js` (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology). They are not individual videos.
- The final `CaseLibrary` uses the shared `VALVE_PLAYLIST` / `VALVE_CHANNELS`.

**Reviewer:** please open the three video IDs on a network with YouTube access and confirm the titles and channels before release (especially `nF13Y58p5_8`). Replace any that fail. Ideally add an endocarditis video from one of the recommended channels as well; I couldn't search them.

## Things a clinical reviewer should check

1. **Empirical therapy** — flucloxacillin + vancomycin pending identification is framed as tailored to local MRSA prevalence. ESC 2023 tables list ampicillin/(flu)cloxacillin-based regimens for community-acquired native-valve IE. Check this framing matches local policy for PWID.
2. **TOE in isolated right-sided IE** — "Yes" scores best (S. aureus, procedure planning, PFO). "No, the guideline exempts it" scores 5/10 as acceptable.
3. **2-week regimen criteria** — taught as: MSSA, uncomplicated, isolated right-sided native valve, vegetation < 20 mm, no empyema/metastatic infection, rapid response, no severe immunosuppression (CD4 < 200).
4. **Surgery/debulking indications** — ESC 2023 IIa (vegetation > 20 mm after recurrent emboli, RV failure from TR refractory to diuretics, left-heart involvement, bacteraemia ≥ 7 days). Aspiration is IIb in high surgical risk. The case acts on day 6 with bacteraemia at 5 days plus the > 20 mm/recurrent-emboli indication; the text says day 7 is the bacteraemia threshold.
5. **POET** — criteria are paraphrased (≥ 10 days IV, ≥ 7 days after surgery, afebrile > 2 days, CRP < 25% of peak or < 20 mg/L, WCC < 15, no abscess). Oral regimens are given as examples. The case says plainly that applying POET to PWID is extrapolation.
6. **Doses** — flucloxacillin 12 g/day (2 g 4-hourly); cefazolin 6 g/day; vancomycin target AUC 400–600 or trough 15–20 mg/L; daptomycin ≥ 10 mg/kg/day.
7. **Rifampicin–methadone** — "can more than halve methadone levels". Withdrawal within days; reversal after stopping takes about 1–2 weeks.
8. **Needle decompression** — the adult site is the ATLS 10th edition 4th/5th ICS just anterior to the mid-axillary line. The 2nd ICS mid-clavicular line is "acceptable" (4/10) and noted as the paediatric site. Check this matches local prehospital protocols (paramedic audience).
9. **Aspiration device details** (22F-class funnel cannula, veno-venous circuit with filter, ACT 250–300 s, jugular + femoral access) are generic, not tied to one product. Confirm the wording is acceptable.
10. **War stories** are composites; all names and details are invented.

## Files

- `index.jsx` — the case (12 stages, `VALVE_07` definition)
- `sims.jsx` — the local simulators listed above
- `meta.js` — key and bed header
- `REPORT.md` — this file

No kit, registry, hospital, App or CSS files were touched.
