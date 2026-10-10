# Case 09 — Prosthetic Valve Dysfunction: *The Valve That Went Quiet*

`cv-valve:9` · Valvular & Structural Heart Unit, bed 9 · `src/cases/valve09/`

Mrs Amal Farouk, 57, has rheumatic heart disease, a 27 mm bileaflet mechanical mitral valve (2001), two previous sternotomies (the second complicated by mediastinitis) and permanent AF. A private clinic switched her warfarin to rivaroxaban 7 weeks ago. She presents in pulmonary oedema, and her husband reports that the valve's "ticking" has gone quiet. The diagnosis is obstructive thrombosis with one stuck leaflet. Because a third sternotomy is very high risk and the thrombus is small, the heart team chooses slow-infusion low-dose alteplase. Afterwards warfarin is rebuilt to INR 3.0. On day 4 she has an embolic left MCA stroke, which is treated with thrombectomy.

Guidelines followed (also listed in the file header): ESC/EACTS 2025 VHD, ACC/AHA 2020 VHD (where it differs on fibrinolysis), ASE/SCMR/SCCT 2024 prosthetic valve imaging, ESC 2023 endocarditis and ESC 2018 pregnancy (anti-Xa targets).

## Stages (12) and points

| # | id | Stage | Max |
|---|---|---|---|
| 1 | s1 | 🚑 "My valve has gone quiet": vignette, valve-click auscultation, ECG, monitor, bloods, diagnosis, first hour, heparin timing, rate control | 38 |
| 2 | s2 | 📏 Prosthetic Doppler (peak E, PHT, VTI → DVI, EOA), ASE criteria, high flow vs mismatch, cinefluoroscopy angles, TOE, thrombus vs pannus vs endocarditis | 61 |
| 3 | s3 | 👥 Heart team: surgery vs lysis, consent, contraindications | 28 |
| 4 | s4 | 🧮 PVT decision map (planner), regimen, heparin start time, guideline disagreement | 30 |
| 5 | s5 | 🩸 Set-up checklist and protocol sequence | 14 |
| 6 | s6 | 🎬 Branches: stop criteria, collapse mid-infusion, non-response (pannus), each with its consequence | 25 |
| 7 | s7 | 💉 Lysis simulator (pump rate, hourly checks, ooze, end-of-dose decision), definition of success | 28 |
| 8 | s8 | 🛏️ VKA vs DOAC, INR target table, aspirin, INR log (5 visits), interactions, dental extraction, bridging sequence | 67 |
| 9 | s9 | 🚨 Day-4 stroke on anticoagulation (vitals move): first 10 min, CT/CTA, thrombectomy, restarting anticoagulation, contrast case with ICH reversal | 47 |
| 10 | cyc | 🧠 Three vicious cycles (obstructed mitral; hinge stasis; paravalvular haemolysis) + 2 decisions | 18 |
| 11 | mm | 💀 Six war stories, each with a death or near-death (RE-ALIGN-style DOAC switch, unbridged warfarin stop for a tooth, 10 mg IV vitamin K, unmonitored LMWH in pregnancy, full-dose lysis for a large clot, rifampicin), with 4 scored decisions | 40 |
| 12 | s10 | 🏁 Discharge plan, 10-question quiz, score table, 11 take-home points, CaseLibrary | 28 |
| | | **Total** | **424** |

Teaching-device counts: 10 `Why`, 11 `Contrast`, 6 `WarStory`, 3 `ViciousCycle` (each with ≥ 4 nodes and ≥ 3 breaks).

## Simulators built (`sims.jsx`, in the kit's style)

- **ValveClicks**: synthesised phonocardiogram and WebAudio sound for three valves: a working mechanical mitral valve, hers (muffled closing click, no opening click, diastolic rumble, AF), and a working mechanical aortic valve for contrast.
- **ProstheticDoppler**: CW Doppler of mitral prosthesis inflow. The learner sets the peak-E caliper and the deceleration slope (PHT = 0.29 × DT); the auto-trace then gives VTI and mean gradient. DVI and EOA are calculated in follow-up decisions. True values: Vp 2.6 m/s, DT 790 ms (PHT ≈ 230 ms), VTI ≈ 85 cm, mean ≈ 15 mmHg, DVI ≈ 5.3, EOA ≈ 0.6 cm².
- **CineFluoro**: fluoroscopy of a bileaflet valve. The learner steers RAO/LAO and CRA/CAU until the ring is edge-on, freezes in diastole, and measures each leaflet with a protractor. Scored on view, leaflet A (85°) and leaflet B (35°, stuck). `LysisRun` reuses it in a fixed view.
- **PvtPathway**: the decision map for obstructive vs non-obstructive thrombosis, left vs right side, clinical state, surgical risk, thrombus area and lysis contraindications. The learner sets it to the patient's profile.
- **LysisRun**: an hour-by-hour alteplase 25 mg / 6 h infusion. Covers pump-rate choice (including the 10× error), hourly neuro and bleeding checks, a cannula ooze at hour 3, the end-of-dose decision and a second dose.
- **InrChart**: an SVG INR log against the 2.5–3.5 band. It drives five sequential anticoagulation-clinic decisions, including a clarithromycin interaction and a sub-therapeutic INR.

## Verification

- `npx vite build` succeeds.
- Playwright playthrough (`playwright-core`, Chromium 1194, preview on :5180), opened at `/#case=cv-valve:9`. Scrub in, every stage via `.cs-nav-item`, every decision, multi-select and sequence answered correctly, every simulator run. **Score 424 / 424 at 1280×900 and at 390×844.**
- Page errors: none. One console error at desktop size: the Wikimedia image request failed (`ERR_TUNNEL_CONNECTION_FAILED`) because this sandbox blocks commons.wikimedia.org. The `Figure` falls back to a link as designed.
- Screenshots checked: cover, s1, Doppler, fluoroscopy, lysis, crisis, cycle and score, at desktop and phone size. Nothing is overlapped or cut off apart from the shell's own floating chips and sticky vitals strip.
- 3D ward: lift → floor 05 (Valvular & Structural Heart Unit) → Bed 09 shows "Prosthetic Valve Dysfunction — The Valve That Went Quiet" with **Open case**, and clicking it opens the case.

## Media and how it was verified

**This environment's egress policy blocks youtube.com and commons.wikimedia.org (HTTP 403 at the proxy; WebFetch DNS failure), so no link could be opened directly.** Each item below was instead confirmed through the web-search index, which returned the exact page with its title. Channel names could **not** be confirmed, so each `Video` falls back to the label "YouTube". A reviewer should open each one once.

| Where | Item | Evidence |
|---|---|---|
| s1 | Figure `File:Aortic_Karboniks-1_bileafter_prosthetic_heart_valve.jpg`, public domain (uploader Stif Komar) | Commons file page in search index, with its public-domain licence stated |
| s1 | Video `rbfAzdO5tX4`: "Echo Pearls Introducting prosthetic heart valves" | youtube.com/watch?v=rbfAzdO5tX4 in search index |
| s2 | Video `YfIVj1WcM8w`: "Echocardiographic Assessment of Prosthetic Valves" | search index |
| s2 | Video `T1IqM9CwGFc`: "Assessing velocities and gradients of prosthetic valves using echo" (appears to be an Echo Masterclass / Medmastery lesson) | search index |
| s2 | Video `_nIIxhS6fHc`: "Diagnosing prosthetic valve endocarditis with echocardiography" | search index |
| s3 | Video `e0ERw33Irdg`: "Prosthetic Valve Assessment (William A. Zoghbi, MD) April 29, 2016" | search index |
| s8 | Video `UfHiYFIdnHs`: "Warfarin Monitoring & INR Explained" | search index |
| s7 | Channel *search* links on CCC Live Cases, Gulf Intervention Society and Interventional Cardiology (prosthetic valve / valve thrombosis) | URLs follow the pattern already used in `valveMedia.js`; not opened |
| s10 | `CaseLibrary` with `VALVE_PLAYLIST` / `VALVE_CHANNELS` from `valveMedia.js` | reused from the earlier, verified cases |

No video from the three recommended channels could be identified on prosthetic valve thrombosis, because the channels themselves could not be searched from here.

## For the clinical reviewer — please check

1. **Fibrinolysis positioning.** I state ESC/EACTS as: urgent surgery first-line when risk is acceptable (class I); fibrinolysis when surgery is very high risk or unavailable, or for right-sided prostheses. ACC/AHA 2020 is stated as treating slow-infusion low-dose fibrinolysis and surgery as equal first-line options. Please confirm the exact 2025 ESC/EACTS wording and class, especially whether it now names the low-dose slow regimen.
2. **Low-dose protocol details:** 25 mg over 6 h without bolus, repeated up to ~6–8 doses and a cumulative ≤ ~150 mg; ultraslow 25 mg over 25 h; UFH paused during each infusion and restarted between doses. The text says to follow the local protocol. Please also check the consent numbers ("8–9 in 10 reopen, ~1 in 10 complication, a small number die"), which are given as approximate ranges.
3. **TOE thrombus area threshold** of 0.8 cm² (with prior stroke) as the predictor of lysis complications.
4. **Prosthetic mitral criteria** (peak E, mean gradient, DVI, EOA, PHT) and the mismatch thresholds (mitral EOAi ≤ 1.2 moderate, ≤ 0.9 severe).
5. **Cinefluoroscopy angles.** "Opens to ~85°, closes at ~30°" relative to the ring plane is a simplification; real values are model-specific.
6. **INR target table** (thrombogenicity × patient risk factors) and the patient's target of 3.0.
7. **Timing of anticoagulation after a small ischaemic stroke** in a recently thrombosed mechanical mitral valve: UFH without bolus at 24 h, with no haemorrhagic transformation. The evidence is observational and the text says so.
8. **Bridging timeline** for a high-bleeding-risk polypectomy, and the dental extraction advice to continue warfarin.
9. **Pregnancy LMWH anti-Xa targets** (peak 1.0–1.2 IU/mL mitral, 0.8–1.2 aortic; ESC 2018).
10. **CT attenuation** for thrombus vs pannus is described only qualitatively ("cut-offs vary between studies").
