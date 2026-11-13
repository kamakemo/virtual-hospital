# 🫀 The Echocardiography Unit — builder's guide

The Cardiac Imaging & Diagnostics floor (`cv-imaging`) is an **echo lab**: every
bay is an echo station and every case is a hands-on echo study. Together the
cases form one course that takes a cardiologist from the probe to the report.

Read `docs/CASE_CONTRACT.md` first — it applies in full (philosophy, emoji,
12 stages, minimum counts, scoring, definition of done, files you may touch).
This page adds what is specific to echo.

## 🗺️ The course map

| Bay | Key | Case | Poster topics covered |
|---|---|---|---|
| 1 | `cv-imaging:1` | Echo 01 — the systematic TTE after an anterior MI (done: `src/cases/echo01/`) | Echo protocol, views, LV size, EF, wall motion |
| 2 | `cv-imaging:2` | The cardiac cycle on echo: anatomy, physiology, M-mode | Heart anatomy, cardiac physiology |
| 3 | `cv-imaging:3` | Doppler & haemodynamics | Echo haemodynamics, valvular quantification |
| 4 | `cv-imaging:4` | Diastolic function & the left atrium | LV diastolic function, LA function |
| 5 | `cv-imaging:5` | The right heart & pulmonary pressure | RV function, right-heart haemodynamics |
| 6 | `cv-imaging:6` | Speckle tracking, strain & AI | Speckle tracking, LV systolic function, AI echo |
| 7 | `cv-imaging:7` | 3D / 4D echo & interventional guidance | 3D echo, 4D echo, interventional echo |

## 🧠 What "real echo simulation" means here

- The learner **does** the study: places a sample volume, traces a spectral
  envelope, measures a velocity, a time, a diameter, an area; chooses the view;
  optimises the machine (gain, scale, baseline, sweep, angle).
- Every number on the screen is **computed from a model** of the patient, so a
  badly placed sample volume, a wrong angle or a wrong frame gives a wrong
  number — and the case shows why.
- The image looks like echo: black blood, grey speckled myocardium, bright
  valves and pericardium; spectral Doppler as a grey-scale velocity–time
  display with an ECG underneath; colour Doppler with a BART colour bar
  (Blue Away, Red Toward), aliasing at the Nyquist limit.
- No image files and no videos unless you have opened and verified them.
  Draw everything on canvas / SVG in your own folder.

## 🔧 The echo engine you can import (read-only — do not edit `src/cases/echo01/`)

`src/cases/echo01/heart.js`
- Patient frame: x = patient's left, y = cranial, z = anterior (cm).
- `classify(p, phase)` → `{ k, v, seg?, m? }` — what tissue is at 3D point `p`
  (kinds: `lvc`, `rvc`, `la`, `ra`, `ao`, `dao`, `myo`, `scar`, `rvw`, `aw`,
  `aow`, `valve`, `peri`, `fat`, `liver`, `dia`, `wall`, `lung`, `thrombus`).
- `sys(phase)` systolic activation 0–1, `ES` (end-systolic phase), `HR`.
- Landmarks: `M0` (mitral annulus), `T0` (tricuspid), `AV`, `APEX`, `A` (long
  axis), `AO`, `LA_C`, `RA_C`, `RV_C`, `dirSeg(deg)` (17-segment wheel angle →
  direction), `segmentOf`, `SEGMENTS`, `MOTION`, `EDV`, `ESV`, `EF`.
- This heart is Echo 01's patient (anterior MI, apical aneurysm, thrombus).
  For a different patient, **copy `heart.js` into your folder and change it**
  (e.g. a normal LV, a dilated RV, a thick LV) — keep the same exports.

`src/cases/echo01/views.js`
- `WINDOWS`, `VIEWS`, `VIEW_BY_ID` (`plax`, `psax-av`, `psax-mv`, `psax-pm`,
  `psax-ap`, `a4c`, `a5c`, `a2c`, `a3c`, `sub4c`), `viewBasis(view)` → probe
  pose `{ S, b, l, n }`, `applyPose(base, { dx, dy, rotDeg, tilt, rock })`,
  `inPlane(pose, p)` → `{ depth, lat, off }`, `viewQuality(pose, view)`.

`src/cases/echo01/render.js`
- `drawEcho(g, w, h, { pose, depth, phase, gain, labels, title })` — the 2D
  image for any plane; returns the sector geometry `{ cx, cy, scale }` (use it
  to place overlays such as a sample volume, an M-mode cursor or a colour box).
- `drawDiagram(...)` — the same slice as a labelled diagram.
- `sectorGeom(w, h, depth)`.

`src/cases/echo01/EchoLab.jsx` — the full scanning lab (3D probe + screen +
controls). Props: `start`, `startPose`, `task`, `onLock`, `onMeasure`,
`onAcquire`, `presets`. Use it when the learner should find a view first.

If your copy of the heart differs from Echo 01's, copy `render.js` / `views.js`
too and point them at your `heart.js` (they import `./heart.js`).

## 📐 Conventions

- Spectral Doppler: velocity toward the probe above the baseline; cm/s or m/s
  on the y-axis; sweep 50–100 mm/s; ECG strip under the trace.
- Simplified Bernoulli ΔP = 4v² (v in m/s); continuity; PISA; VTI in cm.
- Follow ASE/EACVI recommendations: chamber quantification (2015), diastolic
  function (2016 — say if you use a newer update), right heart (2010/2015),
  valve stenosis (2017) and regurgitation (2017), strain (EACVI/ASE task
  force), 3D (2012). Name the document in the file header.
- Score every measurement by how close it is to the model's true value and
  whether it was made correctly (right view, right frame, right angle).
- Brand line: `Cardiac Imaging · Echo 0N`; `meta.js` header starts `Echo 0N — …`.
- Phone and desktop must both work (canvases must resize; sliders usable).
