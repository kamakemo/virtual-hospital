import { createClient } from '@supabase/supabase-js';

/* ============================================================
   BACKEND
   Supabase (the same project as before): auth, the `admins`
   table, the `cases` table and the `rich-cases` storage bucket.
   Without the two VITE_ variables the site runs in DEMO MODE:
   browsing works, and the admin panel saves to this browser's
   localStorage so it can be tried out.
   ============================================================ */

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = () => Boolean(url && key && !url.includes('placeholder'));

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const BUCKET = 'rich-cases';
const DEMO_KEY = 'vh-demo-content';
const demoRead = () => { try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '{}'); } catch { return {}; } };
const demoWrite = v => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(v)); return null; } catch (e) { return e; } };

/* ---------- auth ---------- */

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}
export function onAuthChange(fn) {
  if (!isSupabaseConfigured()) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, session) => fn(session));
  return () => data.subscription.unsubscribe();
}
export const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
export const signUp = (email, password) => supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
export const resetPassword = email => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
export const signInWithGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
export const signOut = () => supabase.auth.signOut();

export async function isUserAdmin(email) {
  if (!isSupabaseConfigured()) return true;                 // demo mode: the panel is local-only
  if (!email) return false;
  const { data, error } = await supabase.from('admins').select('email').eq('email', email).maybeSingle();
  if (error) { console.error('[admins]', error.message); return false; }
  return Boolean(data);
}

/* ---------- content: one row per case / session / test ---------- */

/** Map of item id → { title, htmlUrl, html (demo), fileName, updatedAt }. */
export async function fetchContent() {
  if (!isSupabaseConfigured()) return demoRead();
  const { data, error } = await supabase.from('cases').select('id, title, html_url, data, updated_at').not('html_url', 'is', null);
  if (error) { console.error('[cases]', error.message); return {}; }
  const out = {};
  for (const r of data || []) out[r.id] = { title: r.title, htmlUrl: r.html_url, fileName: r.data?.fileName, updatedAt: r.updated_at };
  return out;
}

/** Upload an HTML file for an item and publish it. */
export async function saveContent(item, { html, fileName, title }) {
  const now = new Date().toISOString();
  if (!isSupabaseConfigured()) {
    const all = demoRead();
    all[item.id] = { title, html, fileName, updatedAt: now };
    const err = demoWrite(all);
    return err ? { error: { message: 'This browser could not store the file (it may be too large for local storage).' } } : { data: all[item.id] };
  }
  const safe = (fileName || `${item.id}.html`).replace(/[^a-zA-Z0-9.\-_]/g, '-').replace(/-+/g, '-').toLowerCase();
  const path = `cases/${item.id}/${Date.now()}-${safe}`;
  const file = new File([html], safe, { type: 'text/html; charset=utf-8' });
  const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: 'text/html; charset=utf-8', cacheControl: '60', upsert: false });
  if (up.error) return { error: up.error };
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const row = {
    id: item.id, hospital: item.section, department: item.unit, bed_number: item.n,
    title: title || item.title, case_type: 'rich-html', html_url: pub.publicUrl,
    data: { fileName: safe, path },
  };
  const { data, error } = await supabase.from('cases').upsert(row, { onConflict: 'id' }).select().single();
  if (error) return { error };
  return { data: { title: data.title, htmlUrl: data.html_url, fileName: safe, updatedAt: data.updated_at || now } };
}

/** Unpublish an item: remove the row and its stored file. */
export async function removeContent(item, entry) {
  if (!isSupabaseConfigured()) {
    const all = demoRead(); delete all[item.id]; demoWrite(all); return {};
  }
  const path = entry?.htmlUrl?.split(`/${BUCKET}/`)[1];
  if (path) await supabase.storage.from(BUCKET).remove([decodeURIComponent(path)]);
  const { error } = await supabase.from('cases').delete().eq('id', item.id);
  return { error };
}

/** The HTML text of a published item. */
export async function loadHtml(entry) {
  if (!entry) return null;
  if (entry.html != null) return entry.html;
  const res = await fetch(entry.htmlUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load the file (HTTP ${res.status}).`);
  return res.text();
}
