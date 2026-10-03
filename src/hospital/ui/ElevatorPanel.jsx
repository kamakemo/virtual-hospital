import React, { useMemo, useState } from 'react';
import { WINGS, pad2 } from '../data.js';

/* ============================================================
   ELEVATOR PANEL
   The floor selector, styled after a lift car's operating panel:
   a dark indicator display, a wing selector, and round buttons
   that light in the department's colour. On phones it folds to
   a single "Floors" bar that opens the same panel as a sheet.
   ============================================================ */

function Display({ wingId, number, preview }) {
  const wing = WINGS.find(w => w.id === (preview?.wingId || wingId));
  const n = preview ? preview.number : number;
  const floor = wing && n ? wing.floors.find(f => f.number === n) : null;
  return (
    <div className="lift-display" aria-live="polite">
      <div className="lift-digits">
        <span className="lift-arrow" aria-hidden="true">{n ? '▲' : '■'}</span>
        <span>{n ? pad2(n) : 'G'}</span>
      </div>
      <div className="lift-dest">
        {floor ? floor.name : 'Main entrance · Lobby'}
      </div>
    </div>
  );
}

export default function ElevatorPanel({ current, onSelect, onLobby, onPreview, busy, compact = false }) {
  const [wingId, setWingId] = useState(current?.wingId || 'cardiology');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const wing = useMemo(() => WINGS.find(w => w.id === wingId), [wingId]);

  // floors read top-down, as on a real panel
  const floors = [...wing.floors].reverse();

  const choose = (f) => {
    setOpen(false);
    setPreview(null);
    onPreview?.(null);
    onSelect(wing.id, f.number);
  };

  const hover = (f) => {
    const p = f ? { wingId: wing.id, number: f.number } : null;
    setPreview(p);
    onPreview?.(p);
  };

  return (
    <>
      <button
        type="button"
        className={'lift-toggle' + (compact ? ' lift-toggle-compact' : '')}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="lift-panel"
      >
        <span className="lift-toggle-num">{current?.number ? pad2(current.number) : 'G'}</span>
        <span className="lift-toggle-label">Floors</span>
      </button>

      <aside id="lift-panel" className={'lift' + (open ? ' is-open' : '') + (compact ? ' lift-compact' : '')} aria-label="Floor selector">
        <div className="lift-face">
          <Display wingId={current?.wingId} number={current?.number} preview={preview} />

          <div className="lift-wings" role="tablist" aria-label="Wing">
            {WINGS.map(w => (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={w.id === wingId}
                className={'lift-wing' + (w.id === wingId ? ' is-on' : '')}
                onClick={() => setWingId(w.id)}
              >
                {w.tab}
              </button>
            ))}
          </div>

          <div className="lift-buttons">
            {floors.map(f => {
              const here = current?.wingId === wing.id && current?.number === f.number;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={busy}
                  className={'lift-btn' + (here ? ' is-here' : '')}
                  style={{ '--hue': f.hue }}
                  onClick={() => choose(f)}
                  onMouseEnter={() => hover(f)}
                  onMouseLeave={() => hover(null)}
                  onFocus={() => hover(f)}
                  onBlur={() => hover(null)}
                  title={`Floor ${f.number} — ${f.name}`}
                  aria-label={`Floor ${f.number}, ${f.name}`}
                >
                  <span className="lift-btn-ring">{f.number}</span>
                  <span className="lift-btn-name">{f.name}</span>
                </button>
              );
            })}
            <button
              type="button"
              disabled={busy}
              className={'lift-btn lift-btn-g' + (!current?.number ? ' is-here' : '')}
              onClick={() => { setOpen(false); onLobby(); }}
              aria-label="Ground floor, leave the building"
              title="Ground — outside the hospital"
            >
              <span className="lift-btn-ring">G</span>
              <span className="lift-btn-name">Lobby · outside</span>
            </button>
          </div>
        </div>
      </aside>
      {open && <div className="lift-scrim" onClick={() => setOpen(false)} />}
    </>
  );
}
