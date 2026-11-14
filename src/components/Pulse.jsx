import React, { useEffect, useRef, useState } from 'react';

/* The live trace behind the home headline. It is a real sweep, like a bedside
   monitor — and it answers the visitor: move the pointer and the rate climbs. */

const ecg = p => (p < 0.1 ? Math.sin(p / 0.1 * Math.PI) * 0.1 : p < 0.16 ? 0 : p < 0.18 ? -0.12 : p < 0.2 ? -0.12 + (p - 0.18) / 0.02 * 1.12 : p < 0.225 ? 1 - (p - 0.2) / 0.025 * 1.3 : p < 0.25 ? -0.3 + (p - 0.225) / 0.025 * 0.3 : p < 0.34 ? 0 : p < 0.5 ? Math.sin((p - 0.34) / 0.16 * Math.PI) * 0.22 : 0);

export default function Pulse() {
  const ref = useRef(null);
  const [bpm, setBpm] = useState(64);
  useEffect(() => {
    const c = ref.current, g = c.getContext('2d');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, buf = new Float32Array(0), head = 0, phase = 0, rate = 64, target = 64, raf, last = performance.now(), lastShown = 0;
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; g.setTransform(d, 0, 0, d, 0, 0); buf = new Float32Array(Math.max(1, Math.ceil(w))); if (still) { for (let i = 0; i < buf.length; i++) buf[i] = ecg((i / 190) % 1); } };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const move = e => { target = Math.min(148, target + Math.hypot(e.movementX || 0, e.movementY || 0) * 0.05); };
    window.addEventListener('pointermove', move, { passive: true });
    
    const loop = now => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      target += (62 - target) * dt * 0.35; rate += (target - rate) * dt * 3;
      if (!still) {
        const px = 150 * dt;
        for (let k = 0; k < px; k++) { phase = (phase + (rate / 60) * dt / px) % 1; head = (head + 1) % buf.length; buf[Math.floor(head)] = ecg(phase); }
      }
      g.clearRect(0, 0, w, h);
      const lime = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#C8FF3D';
      g.strokeStyle = lime; g.lineWidth = 2.2; g.lineJoin = 'round'; g.shadowColor = lime; g.shadowBlur = 16;
      const mid = h * 0.62, amp = h * 0.42;
      g.beginPath();
      let pen = false;
      for (let x = 0; x < buf.length; x++) {
        const gap = !still && ((x - head + buf.length) % buf.length) < 40;
        if (gap) { pen = false; continue; }
        const y = mid - buf[x] * amp;
        pen ? g.lineTo(x, y) : g.moveTo(x, y); pen = true;
      }
      g.stroke();
      if (!still) { g.fillStyle = lime; g.beginPath(); g.arc(head, mid - buf[Math.floor(head)] * amp, 4, 0, 7); g.fill(); }
      g.shadowBlur = 0;
      if (now - lastShown > 400) { lastShown = now; setBpm(Math.round(rate)); }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('pointermove', move); };
  }, []);
  return (
    <div className="pulse" aria-hidden="true">
      <canvas ref={ref} />
      <div className="pulse-read mono"><span className="pulse-dot" />HR <b>{bpm}</b> bpm<small>move — it's listening</small></div>
    </div>
  );
}
