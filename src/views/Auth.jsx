import React, { useState } from 'react';
import { Loader2, Mail, Check } from 'lucide-react';
import { Mark } from '../ui/Chrome.jsx';
import { Button, Eyebrow, cx } from '../ui/kit.jsx';
import { HOSPITAL } from '../data/curriculum.js';
import {
  signInWithPassword, signUpWithPassword, signInWithMagicLink,
  signInWithProvider, sendPasswordReset, resendConfirmation,
} from '../supabaseClient.js';

const MODES = [
  { id: 'signin', label: 'Sign in' },
  { id: 'signup', label: 'Create account' },
  { id: 'link',   label: 'Email a link' },
];

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const reset = () => { setNote(''); setErr(''); setNeedsConfirm(false); };

  const submit = async e => {
    e.preventDefault();
    reset();
    if (!email.trim()) { setErr('Enter your email address.'); return; }
    setBusy(true);

    if (mode === 'link') {
      const { error } = await signInWithMagicLink(email.trim());
      setBusy(false);
      if (error) setErr(error.message);
      else setNote(`Check ${email.trim()} — the sign-in link is on its way.`);
      return;
    }

    if (!password) { setBusy(false); setErr('Enter a password.'); return; }

    if (mode === 'signup') {
      const { error } = await signUpWithPassword(email.trim(), password);
      setBusy(false);
      if (error) setErr(error.message);
      else {
        setNeedsConfirm(true);
        setNote(`Account created. Confirm ${email.trim()} using the email we just sent, then sign in.`);
      }
      return;
    }

    const { error } = await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (error) {
      // Supabase returns the same generic message whether the password is wrong
      // or the address was never confirmed — so offer the resend either way.
      setErr(error.message);
      if (/confirm/i.test(error.message) || /invalid/i.test(error.message)) setNeedsConfirm(true);
    }
  };

  const oauth = async provider => {
    reset(); setBusy(true);
    const { error } = await signInWithProvider(provider);
    setBusy(false);
    if (error) {
      setErr(
        /not enabled|unsupported/i.test(error.message)
          ? `${provider === 'google' ? 'Google' : 'Microsoft'} sign-in is not switched on for this project yet. Use a password or an email link.`
          : error.message
      );
    }
  };

  const forgot = async () => {
    reset();
    if (!email.trim()) { setErr('Enter your email first, then ask for a reset.'); return; }
    setBusy(true);
    const { error } = await sendPasswordReset(email.trim());
    setBusy(false);
    if (error) setErr(error.message);
    else setNote(`Password reset sent to ${email.trim()}.`);
  };

  const resend = async () => {
    reset();
    setBusy(true);
    const { error } = await resendConfirmation(email.trim());
    setBusy(false);
    if (error) setErr(error.message);
    else setNote(`Confirmation email re-sent to ${email.trim()}.`);
  };

  return (
    <div className="min-h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2.5 text-accent-deep mb-7">
            <Mark size={28} />
            <div className="leading-none">
              <span className="display block text-[17px] text-ink">{HOSPITAL.name}</span>
              <span className="label block text-ink-3 mt-1" style={{ fontSize: 9 }}>Cardiology · Internal Medicine</span>
            </div>
          </div>

          <Eyebrow>Session 2026</Eyebrow>
          <h1 className="display text-[29px] leading-tight text-ink mt-2 mb-2">Sign in to the hospital</h1>
          <p className="text-[14px] text-ink-2 leading-relaxed mb-7">
            Your progress — the cases you have worked and the sessions you have sat in on — is
            kept against your account.
          </p>

          <div className="flex items-center gap-1 p-1 bg-sunk border border-line rounded mb-6">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); reset(); }}
                className={cx(
                  'flex-1 py-1.5 rounded text-[12.5px] font-medium transition-colors',
                  mode === m.id ? 'bg-panel text-ink border border-line' : 'text-ink-3 hover:text-ink-2'
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label htmlFor="email" className="label text-ink-3 block mb-1.5">Email</label>
              <input
                id="email" type="email" value={email} autoComplete="email"
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.org"
                className="w-full bg-panel border border-line rounded px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
            </div>

            {mode !== 'link' && (
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label htmlFor="password" className="label text-ink-3">Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={forgot} className="text-[12px] text-accent-deep hover:underline">
                      Forgot it?
                    </button>
                  )}
                </div>
                <input
                  id="password" type="password" value={password}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  className="w-full bg-panel border border-line rounded px-3 py-2 text-[14.5px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                />
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : mode === 'link' ? <Mail size={14} /> : null}
              {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Email me a sign-in link'}
            </Button>
          </form>

          {err && (
            <p className="mt-4 text-[13px] text-crit leading-relaxed border-l-2 border-crit pl-3">{err}</p>
          )}
          {note && (
            <p className="mt-4 text-[13px] text-good leading-relaxed border-l-2 border-good pl-3 flex gap-2">
              <Check size={14} className="shrink-0 mt-0.5" /> {note}
            </p>
          )}
          {needsConfirm && email.trim() && (
            <button onClick={resend} disabled={busy} className="mt-3 text-[12.5px] text-accent-deep hover:underline">
              Re-send the confirmation email
            </button>
          )}

          <div className="flex items-center gap-3 my-7">
            <span className="flex-1 border-t border-line" />
            <span className="label text-ink-3">or</span>
            <span className="flex-1 border-t border-line" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="quiet" onClick={() => oauth('google')} disabled={busy}>Google</Button>
            <Button variant="quiet" onClick={() => oauth('azure')} disabled={busy}>Microsoft</Button>
          </div>
        </div>
      </div>

      <footer className="border-t border-line py-5 text-center">
        <p className="text-[12px] text-ink-3">{HOSPITAL.name} · {HOSPITAL.tagline}</p>
      </footer>
    </div>
  );
}
