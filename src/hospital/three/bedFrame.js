import * as THREE from 'three';

/* The bed's moving geometry, shared by the bed and the patient builder. */
export const BED = {
  headX: 0.32,
  footX: 2.42,
  hingeX: 1.06,
  deckY: 0.535,
  mattressT: 0.15,
  width: 0.9,
  headLen: 0.72,
};

/** Bed-unit position of a point given in the raised head section's frame. */
export function headToUnit(x, y, angle, z = 0) {
  const c = Math.cos(-angle), s = Math.sin(-angle);
  return new THREE.Vector3(BED.hingeX + x * c - y * s, BED.deckY + x * s + y * c, z);
}
