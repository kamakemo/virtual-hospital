import React from 'react';
import { pad2 } from '../data.js';

/* Brushed-steel lift doors that close over the scene while the next
   floor is built, with the car's floor indicator counting between them. */
export default function ElevatorDoors({ state, from, to, label }) {
  // state: 'open' | 'closing' | 'closed' | 'opening'
  const shut = state === 'closing' || state === 'closed';
  return (
    <div className={'doors' + (shut ? ' is-shut' : '') + (state === 'open' ? ' is-idle' : '')} aria-hidden={state === 'open'}>
      <div className="door door-l" />
      <div className="door door-r" />
      <div className="doors-indicator">
        <div className="doors-num">
          <span className="doors-arrow">{to === 0 ? '▼' : (to || 0) >= (from || 0) ? '▲' : '▼'}</span>
          {to ? pad2(to) : 'G'}
        </div>
        {label && <div className="doors-label">{label}</div>}
      </div>
    </div>
  );
}
