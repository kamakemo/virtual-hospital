# Case 05 — Functional Mitral Regurgitation in Heart Failure

**Key:** `cv-valve:5` · Valvular & Structural Heart Unit (Cardiology wing, floor 05), bed 5
**Header:** Functional Mitral Regurgitation in Heart Failure — The Ventricle Is the Disease
**Patient:** Mr Samuel Okafor, 67 M — old inferior MI (occluded RCA), ischaemic cardiomyopathy, EF 28%, LBBB 162 ms, CKD 3a, on sub-target doses since 2019.
**Score total (perfect run):** **397 / 397**

## Stages

| # | Stage | What happens | Points |
|---|---|---|---|
| 1 | 🚑 Warm and wet, then cold | Vignette, observations, auscultation (`mr-chronic` vs acute/MVP/normal), LBBB 12-lead, CXR/bloods; diagnosis, first hour, IV furosemide dose (1–2× oral), then SCAI C shock at 23:40 (moving vitals): dobutamine, hold β-blocker, noradrenaline never alone, IABP/Impella | 37 |
| 2 | 📏 Measure the leak — then weigh it | **FunctionalPISA** sim (scored 12), severity criteria in low flow, why PISA under-reads a crescent orifice, pulmonary veins, Carpentier IIIb; **ProportionPlot** (EROA vs LVEDV, COAPT/MITRA-FR/patient presets); why the trials differed; don't refer while wet | 46 |
| 3 | 👥 Heart team | Angio + CMR (non-viable inferior scar), ventricle-first plan, CRT criteria, CRT-D vs CRT-P, communicating with the patient | 34 |
| 4 | 🧮 GDMT titration | **GdmtBoard** — five clinic visits (in-hospital four-pillar start with 36-h ACEi washout, eGFR dip, up-titration, tamsulosin/diuretic "make room", NSAID + salt-substitute hyperkalaemia) scored 20; IV iron | 30 |
| 5 | 🩸 CRT-D set-up | Checklist, implant `Sequence` (RV lead first in LBBB), LV lead away from scar, paced ECG | 21 |
| 6 | 🎬 Choose your path | 3-month reassessment table, proportionality re-plotted, COAPT selection, TEER vs surgery vs LVAD vs meds, GA under-reads FMR (phenylephrine challenge), first clip position | 36 |
| 7 | 🛠️ TEER | **TetheredClip** — wide A2/P2→A3/P3 jet, up to three clips, residual MR + gradient + insertion (scored 20); decline a third clip | 30 |
| 8 | 🛏️ Back on the unit | Keep GDMT after TEER, antithrombotic (aspirin; practice varies), sick-day rules | 26 |
| 9 | 🚨 Crisis | Gastroenteritis on all four pillars → K⁺ 7.6, AKI, **loss of CRT-D capture**; paramedic decision; **HyperKResus** live strip (calcium first, insulin–glucose, salbutamol, stop drugs, fluids; magnet/noradrenaline/bicarbonate as traps), scored 20; staged restart | 50 |
| 10 | 🧠 Vicious cycle | 3 cycles (FMR spiral, MR shock spiral, hyperkalaemia–underdosing trap) + 2 decisions | 20 |
| 11 | 💀 M&M | 6 war stories, all deaths or near-deaths, 4 scored decisions | 40 |
| 12 | 🏁 Debrief | Discharge plan, 10-question quiz, score table, 10 take-home points, CaseLibrary | 27 |

Kit counts: 12 `Why` chains (≥1 in every stage 1–9), 13 `Contrast` pairs, 3 `ViciousCycle`s, 6 `WarStory`s.

## Simulators built (`sims.jsx`, kit style, `useCanvas` + `cs-*`)

- `FunctionalPISA` — apical colour view of a tethered valve (tenting, central jet, PISA below the coaptation point); EROA, RVol, **RF** from forward SV.
- `ProportionPlot` — SVG plot of EROA vs LVEDV with the expected-EROA curve (RF 50%, EF, mitral VTI 150 cm; Grayburn) and the 0.15 mm²/mL ratio line; presets + sliders.
- `GdmtBoard` — four-pillar dose bars vs target, BP/HR/K⁺/creatinine/weight per visit, one choice per visit with consequences.
- `TetheredClip` — 3D surgical view (correct orientation: LAA/A1P1 lateral, A3P3 medial), multi-clip coverage, gradient, LA v-wave; responsive layout on phones.
- `HyperKResus` — live lead II strip driven by K⁺ and membrane state; loss of capture with an escape rhythm; vitals move with each treatment.

Reused from the kit: `Auscultation`, `ECG12` (LBBB, paced), `PulmonaryVein`, `LAPressure`, `BedsideMonitor`.

## Media — and how each was verified

**YouTube and Wikimedia were blocked from this environment** (`curl` → proxy 403; WebFetch → ENOTFOUND). Videos new to this case were verified through web-search index results (title + video ID on youtube.com); channel names could not be confirmed, so `Video` shows the default "YouTube" label. Reviewer: please open each and confirm.

| Video ID | Title used | Source of verification |
|---|---|---|
| `h-FBjvfl1UA` | Secondary mitral regurgitation: a new target in heart failure (A. Reshad Garan, MD) | Search result "Secondary Mitral Regurgitation: A New Target in Heart Failure - YouTube" |
| `dxwFlkNXscE` | Disproportionate functional MR and heart failure — keynote (A. Hagendorff) | Search result (title truncated in index) |
| `FAGno7PZaQs` | Cardiac resynchronization therapy — animation | Search result |
| `Amq_s1YeDjI` | HF4 — CRT therapy on–off–on animation | Search result |
| `PxoRJN3SVZQ` | Hyperkalaemia: ECG changes animated | Search result |
| `kfr19odmFEI` | ECG changes in hyperkalemia — One Critical Minute | Search result |
| `L_8pDi0pEmE`, `S7z5qpNmluY`, `6_-JZqR-CuM`, `ihEM97ApCqE`, `XiBNAEpbL8U`, `AJLrK8PUtzI` | as in Case 02 | Reused from `valve02` (already on main) |

None of the recommended channels (CCC Live Cases, Gulf Intervention Society, Interventional Cardiology) could be searched for functional-MR videos; the case links to them through `MITRACLIP_SEARCHES`, `VALVE_CHANNELS` and the shared playlist (`valveMedia.js`).

Images (Wikimedia Commons, file pages found via search index):
- `File:Mitral_Valve_Regurgitation.png` — BruceBlaus, CC BY-SA 4.0
- `File:Hyperkalemia_ECG.jpg` — CC BY 4.0 (K⁺ 8.2 mmol/L tracing)

## Testing

- `npx vite build` — passes.
- Playwright playthrough (1280×900 and 390×844): every stage, every decision answered best, all five simulators run — **397/397, no page errors**.
- Screenshots checked: cover, PISA, proportion plot, GDMT board, TEER (desktop and phone; phone readout was cut off and has been moved under the valve), crisis strip before/after treatment.
- 3D ward: lift → Cardiology → floor 5 → bed 05 shows the header on the bed board and in the bed bar; **Open case** opens the case.

## For the clinical reviewer

1. **Severity thresholds for secondary MR** — I used EROA ≥ 0.40 cm² / RVol ≥ 60 mL / RF ≥ 50%, with a note that ≥ 0.30 cm² / ≥ 45 mL may be severe in low flow or crescent orifices. Please confirm the wording against the ESC/EACTS 2025 text.
2. **Proportionality** — the 0.15 mm²/mL ratio and expected-EROA curve (mitral VTI 150 cm) are presented as a teaching heuristic, and the text says the concept is debated.
3. **COAPT/MITRA-FR numbers** — average EROA 0.41 vs 0.31 cm², LVEDV ~192 vs ~252 mL; COAPT NNT ≈ 3 for HF hospitalisation over 2 years; "class I" for TEER in COAPT-like patients is stated as ESC/EACTS 2025. Please check that the class is right.
4. **GDMT details** — K⁺ thresholds (continue ≤ 5.5, halve 5.5–6.0, stop > 6.0), creatinine rise up to ~30%, STRONG-HF figures (15.2% vs 23.3%), the iron-deficiency definition.
5. **Hyperkalaemia** — calcium gluconate 10% 30 mL, insulin 10 units + 25 g glucose, salbutamol 10–20 mg (UKKA 2023). The rhythm strip is schematic, not a diagnostic ECG. The paramedic option says "IV calcium per local protocol", because protocols differ by service.
6. **Antithrombotic after TEER in sinus rhythm** — the case says continue aspirin alone and lets DAPT score as acceptable. Practice varies.
7. **TEER simulator** — coverage and gradient are a simplified model; the 3-clip limit and gradient increments are for teaching.

## Attribution note

The commit uses the session footer from this session's instructions. `docs/CASE_CONTRACT.md` quotes a different `Claude-Session` URL, which looks like it belongs to the session that wrote the contract.
