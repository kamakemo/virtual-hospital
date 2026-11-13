# Virtual Teaching Hospital

A teaching website with two hospitals — a **Cardiology Hospital** and an
**Internal Medicine Hospital** — whose units cover the full curriculum of each
specialty (12 cases per unit), plus a **Conference Centre** and a **Test Centre**.

Every case, session and test is a title until an admin uploads an HTML file for
it in **My account → Admin panel**. Uploaded files are stored in Supabase and
open on the item's page in a sandboxed frame.

## Run locally
```
npm install
npm run dev
```
Without Supabase variables the site runs in demo mode (uploads are kept in the
browser only).

## Connect Supabase
1. Run `supabase-setup.sql` in the Supabase SQL editor (safe to re-run).
2. Add your email to the `admins` table (last line of the SQL file).
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` and in Vercel.

## Where things are
- `src/data/` — hospitals, units and the 12 titles of each unit; conference halls; test tracks.
- `src/pages/` — home, hospital/centre, unit, item and account (admin) pages.
- `src/supabaseClient.js` — auth, admin check, upload and publish.

The previous 3D version of the app is kept on the `archive/3d-hospital` branch.
