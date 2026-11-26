/* Cases that ship with the site. `sim: true` runs in the built-in simulator
   (src/sim); otherwise htmlUrl points at a file in /public/cases. An admin
   upload for the same id replaces the built-in one. */
export const BUILTIN = {
  'c-valve-01': { title: 'Severe Aortic Stenosis — TAVI or SAVR?', sim: true, builtin: true, fileName: 'Simulator case' },
};
