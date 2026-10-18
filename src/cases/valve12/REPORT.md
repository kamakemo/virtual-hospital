# Valvular & Structural Case 12 — Left Atrial Appendage Occlusion

`cv-valve:12` · bed 12, Valvular & Structural Heart Unit · branch `case/valve12-laao`

**Header:** Left Atrial Appendage Occlusion — the Bleeder Who Could Not Be Anticoagulated

**Patient:** Mr Samuel Adeyemi, 78, a retired railway signal engineer. He has permanent AF, hypertension, type 2 diabetes and a prior left MCA stroke (CHA₂DS₂-VA 6). He has CKD 3a, weighs 74 kg and takes apixaban 5 mg twice daily. He comes in with his **third transfusion-requiring jejunal angiodysplasia bleed in 11 months**. The modifiable factors (aspirin, ibuprofen) were removed after the first bleed, and he still bled again on apixaban alone.

**Guidelines and evidence followed (stated in the file header):**
- 2024 ESC/EACTS AF guideline: CHA₂DS₂-VA, and percutaneous LAAO "may be considered" in patients with contraindications to long-term OAC — **class IIb, level C**.
- 2020 EHRA/EAPCI expert consensus update on catheter-based LAAO.
- Trials: PROTECT AF/PREVAIL (pooled 5-year), PRAGUE-17, Amulet IDE, OPTION (NEJM 2024), CHAMPION-AF (NEJM 2026) and CLOSURE-AF (NEJM 2026).
- Also used: HALT-IT (tranexamic acid in GI bleeding), restrictive transfusion, AVERROES (aspirin vs apixaban), and apixaban dose-reduction criteria.

## Stages

| # | id | Stage | Interactive / scored | Max |
|---|---|---|---|---|
| 1 | s1 | 🚑 The third bleed | ECG12 (fast AF); kit `Auscultation` (as-mild vs as-severe — rule out **Heyde's**); dx, resus multi-select, DOAC reversal (andexanet/PCC only if life-threatening; not vitamin K/FFP), restrictive transfusion with vitals moving, Heyde's decision | 47 |
| 2 | s2 | 📏 The appendage & the risk | **LAAFlow** PW Doppler — measure his emptying velocity (10); **RiskBuilder** CHA₂DS₂-VA + HAS-BLED + modifiable factors (12); TOE must-look-for multi-select; why "VA" dropped Sc; rheumatic MS edge case (not an LAAO candidate) | 46 |
| 3 | s3 | 👥 Can he be anticoagulated? | contraindication vs worry; honest evidence note (incl. CHAMPION-AF ischaemic-stroke signal and CLOSURE-AF not non-inferior); recommendation; shared-decision multi-select; "is the plug better?" communication decision | 36 |
| 4 | s4 | 🧮 Morphology, four angles, one device | **Morphology** (chicken wing / windsock / cactus / cauliflower, then name his CT) (10); **TOEMeasure** 0/45/90/135° landing zone + depth (10) → Watchman FLX size with predicted compression (10); low LA pressure before sizing | 40 |
| 5 | s5 | 🩸 Set-up | checklist (thrombus excluded, Hb, pericardiocentesis kit, snares); 7-step `Sequence` | 13 |
| 6 | s6 | 🎬 Choose your path | device strategy for an early-bending chicken wing; non-coaxial sheath; failed tug test; 4 mm leak — each with consequence | 38 |
| 7 | s7 | 🛠️ Cross, deploy, PASS, release | `Steps`: **SeptalPuncture** inferior–posterior with sheath-to-LAA path (12) → **LAADeploy** size + depth, unsheath, PASS checks incl. tug animation and colour seal, recapture allowed (20) → effusion check, iatrogenic ASD, protamine | 54 |
| 8 | s8 | 🛏️ Back on the unit | post-LAAO antithrombotic regimen; monitoring; follow-up imaging; DRT vs PDL contrast | 26 |
| 9 | s9 | 🚨 17:50 — "he's bleeding again" | delayed tamponade that the nurse attributes to a GI rebleed; `BedsideMonitor` with vitals moving; **PulsusLine** — measure the paradox on the arterial line (10); kit `Echo` (effusion 18 mm, RV collapse); actions multi-select; **Pericardio** subxiphoid echo-guided drainage, vitals recovering per 60 mL (12); drain management; autotransfusion in the lab; device-embolisation note | 59 |
| 10 | cyc | 🧠 Vicious cycles | 3 cycles: AF → stasis → stroke → remodelling; tamponade; the bleeder's stop–start spiral. 2 decisions | 20 |
| 11 | mm | 💀 War stories | 7 stories, all with a death or near-death: missed ward tamponade (death), device in the LV, antiplatelets stopped at 2 weeks → DRT stroke, "non-valvular" label on rheumatic MS, thrombus called a pectinate muscle, high puncture → perforation, HAS-BLED 4 so nothing → stroke. 4 scored decisions | 38 |
| 12 | s10 | 🏁 Discharge & debrief | discharge multi-select, 10-question quiz, score table, 10 take-home points, `CaseLibrary` | 27 |

**Total: 444 points.** An automated perfect run scores **444 / 444 with 0 page errors**, at both 1280×900 and 390×844.

**Teaching-device counts:**
- `Why`: 9, one in every stage 1–9.
- `Contrast`: 9.
- `WarStory`: 7, with 4 followed by a scored `Decision`.
- `ViciousCycle`: 3, each with ≥ 4 nodes and ≥ 3 breaks, plus 2 scored decisions.

## Simulators built locally (`sims.jsx`, kit style, promotable)

- **LAAFlow**
  - Shows PW Doppler at the LAA orifice next to a 2D appendage panel.
  - Sinus rhythm gives a ~58 cm/s emptying wave; his AF gives irregular fibrillatory flow peaking at ~18 cm/s, with smoke.
  - The learner sets the peak cursor. Scoring: ±4 cm/s.
- **RiskBuilder**
  - Clickable CHA₂DS₂-VA (ESC 2024, no Sc) and HAS-BLED items, then the modifiable factors.
  - Correct answer: CHA₂DS₂-VA 6 (H, A₂, D, S₂) and HAS-BLED 4 (S, B, E, D).
- **Morphology**
  - SVG templates of the four Wang morphologies, each with prevalence and device implications. Stroke associations follow Di Biase 2012.
  - The learner then names his CT rendering (a chicken wing).
- **TOEMeasure**
  - Four TOE angles. The learner sets a landing-zone caliper and a depth line, then records each angle.
  - True values (mm): 0° 18.6/21, 45° 19.8/23, 90° 20.4/24, 135° 22.0/19.
  - The size chips show predicted compression = 1 − maxLZ/size. Best is 27 mm (≈ 18%).
- **SeptalPuncture**
  - Bicaval and short-axis views of the fossa, plus a third "path to the LAA" panel showing where the sheath will point and an off-axis angle.
  - The aorta warning blocks an anterior puncture.
  - Good = inferior (≤ 0.35) and posterior (≤ 0.5).
- **LAADeploy** (exports `deployModel`)
  - RAO caudal fluoroscopy of a contrast-filled chicken-wing appendage plus a TOE 135° colour view.
  - The learner chooses the size and the deployment depth, unsheathes, then runs the PASS checks:
    - **Position:** −1 to +4 mm.
    - **Anchor:** an animated tug. It is stable if minimum compression is ≥ 10%; otherwise the device slides toward the LA.
    - **Size:** four diameters and compression, target 10–30%.
    - **Seal:** a colour leak in mm; ≤ 3 mm passes.
  - Recapture and release are available.
  - It is a teaching model: the appendage narrows by 0.3 mm per mm of depth, and the device takes up 15% of the oversize.
- **PulsusLine**
  - A radial arterial line with respiration. The learner places the expiratory and inspiratory peak lines.
  - True values: 92 → 68 mmHg (paradox 24). A "this morning" comparison shows 6 mmHg.
- **Pericardio**
  - Choose the approach: subxiphoid echo-guided ✓, apical ✓, or left parasternal near the IMA ✗.
  - Advance while aspirating, confirm with agitated saline, then drain 60 mL at a time. The effusion shrinks and the case vitals recover.

**Kit components reused:** `ECG12` (AF), `Auscultation` (as-mild / as-severe / normal), `Echo` from Physiology (effusion and tamponade), `BedsideMonitor`, `Steps/Step`, and all the teaching widgets. I did not use the kit `TransseptalPuncture`, because its four-chamber panel marks 3.8–4.6 cm above the mitral valve as "good" (green). That is right for TEER but would teach the wrong height for an appendage.

## Media

**Network note:** youtube.com, noembed and commons.wikimedia.org were all blocked from this environment (proxy 403 for curl; DNS failure for WebFetch).
- I could not open any video page or `ytInitialData`, so **no channel could be verified**. Channel names are left off, and the kit shows "YouTube".
- Each id + title below was returned by a **web-search index of youtube.com** (WebSearch restricted to youtube.com). Two of them (`OOarHfU8JiA`, `61FPmtw5RAM`) are already used by Cases 02 and 06.
- **Every video below is UNVERIFIED — please open each one before release.**
- **No images were added**, because no Wikimedia file could be checked.

| Where | id | Title as indexed | Notes |
|---|---|---|---|
| s3 | Ok4CboycmIA | Tell Me More: Left Atrial Appendage Occlusion Device | patient-education style |
| s5 | OOarHfU8JiA | How to guide a transseptal puncture with echocardiography | also in Case 02 |
| s7 | gKBzpjwLMKA | Watchman Procedure for Left Atrial Appendage Occlusion (LAAO) | |
| s7 | 9nUebOY4T34 | Watchman™ Left Atrial Appendage Occlusion | indexed at `youtube.com/watch/9nUebOY4T34` |
| s9 | RSTN4yo5tBM | Pulsus Paradoxus Finally Makes Sense (Tamponade Explained Visually) | |
| s9 | 61FPmtw5RAM | Ultrasound-guided pericardiocentesis | also in Case 06 |
| s10 | COaPGllU2sc | ESC TV at #ESCCongress 2021 — Amulet IDE | title suggests ESC TV; channel not confirmed |

The channel search links (`media.js` → `LAAO_SEARCHES`) are constructed `/@channel/search?query=…` URLs on the recommended channels (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology). They follow the same pattern as `valveMedia.js`, but I could not open them. The final `CaseLibrary` uses the shared `VALVE_PLAYLIST`.

## Verification

- `npx vite build` passes.
- Playwright playthrough (`playwright-core`, Chromium 1194, swiftshader) answers every decision from an answer key parsed out of `index.jsx` and runs every simulator to its best result:
  - **444/444 and 0 page errors**, at 1280×900 and at 390×844.
  - Every stage is left with no unanswered options.
- I reviewed screenshots of the cover, LAAFlow, risk builder, TOE measurement, transseptal, deployment/PASS, pulsus, pericardiocentesis and debrief at both sizes. I redrew the TOE and fluoroscopy canvases after the first review, and fixed aliasing in the pulsus trace so that the peak heights read reliably.
- 3D ward: lift → floor 5 → bed 12 shows the bed tag and bed bar "Left Atrial Appendage Occlusion — the Bleeder Who Could Not Be Anticoagulated" with **Open case**, which opens the case.

## For the clinical reviewer — please check

1. **Guideline class.** I state the ESC 2024 AF recommendation for percutaneous LAAO as **IIb, level C** ("may be considered in patients with contraindications to long-term OAC"). Please confirm against the guideline text.
2. **Trial figures:**
   - CHAMPION-AF (NEJM 2026): composite 5.7% vs 4.8% (non-inferior); ischaemic stroke ~3.2% vs 2.0% (from secondary reports, not the paper itself).
   - OPTION (NEJM 2024): bleeding 8.5% vs 18.1%.
   - CLOSURE-AF (NEJM 2026): not non-inferior.
   - The case cites the direction of each result; please check the numbers against the publications.
3. **Post-LAAO regimen** for a patient who cannot take OAC. The "best" answer is short DAPT until 6–12-week imaging, then SAPT. SAPT from day one is scored "acceptable" (6/10). Practice varies, and the evidence is thin.
4. **Watchman FLX numbers.** Sizes are 20/24/27/31/35 mm with 10–30% compression; the leak threshold is ≤ 5 mm historically, and the sim passes ≤ 3 mm. The statement that FLX tolerates shallower appendages is kept qualitative; check it against the current IFU depth table.
5. **Protamine at the end of LAAO** is scored best ("reasonable, practice varies"), with "never" as acceptable.
6. **Andexanet / PCC.** Reserved for life-threatening bleeding; the case does not give a routine reversal for a bleed that responds to resuscitation.
7. **Prevalence figures** in the morphology cards are given as ranges, because the published series differ widely.
