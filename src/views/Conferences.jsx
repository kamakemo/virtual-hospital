import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Clock, ArrowUpRight, ChevronLeft, ChevronRight, Check, Loader2, MessageSquare } from 'lucide-react';
import { Page } from '../ui/Chrome.jsx';
import {
  Panel, Eyebrow, Divider, Breadcrumb, Button, EmptyState, Chip, Progress,
  SectionHead, Loading, cx,
} from '../ui/kit.jsx';
import { fetchConference, fetchSessions, fetchSession } from '../supabaseClient.js';

/* Sessions are grouped into teaching days of eight — the shape every
   multi-day conference in the hospital is written to. */
const PER_DAY = 8;

function groupIntoDays(sessions) {
  if (sessions.length <= PER_DAY) return [{ day: 1, sessions }];
  const days = [];
  for (let i = 0; i < sessions.length; i += PER_DAY) {
    days.push({ day: days.length + 1, sessions: sessions.slice(i, i + PER_DAY) });
  }
  return days;
}

/* ============================================================
   LIST
   ============================================================ */

export function ConferencesList({ conferences, progress, navigate }) {
  const attendedIn = id => Object.keys(progress?.conferenceProgress?.[id]?.sessions || {}).length;

  return (
    <Page>
      <Breadcrumb trail={[
        { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
        { label: 'Conferences' },
      ]} />

      <section className="pb-9">
        <Eyebrow>Beyond the ward</Eyebrow>
        <h1 className="display text-[36px] sm:text-[46px] leading-[1.06] text-ink mt-2">Conferences</h1>
        <p className="text-[16.5px] text-ink-2 leading-relaxed max-w-read mt-4">
          Multi-day meetings on the subjects that reward depth. Every session carries a written
          lecture, moderated questions with the answers withheld until you want them, and the
          questions worth asking from the floor.
        </p>
      </section>

      <Divider />

      <section className="py-9">
        {conferences.length === 0 ? (
          <EmptyState title="No conferences published" body="Nothing has been scheduled yet." icon={Mic} />
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {conferences.map(c => {
              const attended = attendedIn(c.id);
              return (
                <Panel key={c.id} edge="var(--accent)" className="p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <Eyebrow>{c.dateLabel || 'Conference'}</Eyebrow>
                    {attended > 0 && (
                      <span className="label text-good shrink-0" style={{ fontSize: 9 }}>{attended} attended</span>
                    )}
                  </div>
                  <h2 className="display text-[22px] leading-snug text-ink mt-1 mb-2">
                    <button onClick={() => navigate({ name: 'conference', conferenceId: c.id })} className="text-left hover:text-accent-deep">
                      {c.title}
                    </button>
                  </h2>
                  {c.subtitle && <p className="text-[14px] text-ink-2 leading-relaxed mb-3">{c.subtitle}</p>}
                  {c.description && <p className="text-[13.5px] text-ink-3 leading-relaxed mb-4 line-clamp-3">{c.description}</p>}
                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-line-soft">
                    {c.organizer && <span className="text-[12px] text-ink-3 truncate">{c.organizer}</span>}
                    <button
                      onClick={() => navigate({ name: 'conference', conferenceId: c.id })}
                      className="ml-auto inline-flex items-center gap-1 text-[13px] text-accent-deep hover:underline shrink-0"
                    >
                      Open programme <ArrowUpRight size={13} />
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}
      </section>
    </Page>
  );
}

/* ============================================================
   PROGRAMME
   ============================================================ */

export function ConferenceView({ conferenceId, progress, navigate }) {
  const [conf, setConf] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [c, s] = await Promise.all([fetchConference(conferenceId), fetchSessions(conferenceId)]);
      if (!cancelled) { setConf(c); setSessions(s); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [conferenceId]);

  const days = useMemo(() => groupIntoDays(sessions), [sessions]);
  const attended = progress?.conferenceProgress?.[conferenceId]?.sessions || {};
  const attendedCount = Object.keys(attended).length;

  if (loading) return <Page><Loading label="Loading programme…" /></Page>;
  if (!conf) {
    return (
      <Page>
        <EmptyState
          title="Conference not found"
          body="This conference is no longer published."
          action={<Button onClick={() => navigate({ name: 'conferences' })}>All conferences</Button>}
        />
      </Page>
    );
  }

  return (
    <Page>
      <Breadcrumb trail={[
        { label: 'Hospital', onClick: () => navigate({ name: 'home' }) },
        { label: 'Conferences', onClick: () => navigate({ name: 'conferences' }) },
        { label: conf.title },
      ]} />

      <section className="pb-8">
        <Eyebrow>{conf.dateLabel || 'Programme'}</Eyebrow>
        <h1 className="display text-[34px] sm:text-[44px] leading-[1.06] text-ink mt-2">{conf.title}</h1>
        {conf.subtitle && <p className="text-[17px] text-ink-2 leading-relaxed max-w-read mt-3">{conf.subtitle}</p>}
        {conf.description && <p className="text-[15px] text-ink-2 leading-relaxed max-w-read mt-4">{conf.description}</p>}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-[13px] text-ink-3 nums">
          <span><strong className="text-ink font-semibold">{sessions.length}</strong> sessions</span>
          <span className="text-line">·</span>
          <span><strong className="text-ink font-semibold">{days.length}</strong> {days.length === 1 ? 'day' : 'days'}</span>
          {conf.organizer && <><span className="text-line">·</span><span>{conf.organizer}</span></>}
          {attendedCount > 0 && <><span className="text-line">·</span><span className="text-good">{attendedCount} attended</span></>}
        </div>
        {sessions.length > 0 && (
          <Progress value={attendedCount / sessions.length} className="mt-3 max-w-md" />
        )}
      </section>

      <Divider />

      {sessions.length === 0 ? (
        <section className="py-9">
          <EmptyState title="No sessions yet" body="The programme for this conference has not been published." icon={Mic} />
        </section>
      ) : (
        days.map(({ day, sessions: daySessions }) => (
          <section key={day} className="py-9 border-b border-line last:border-0">
            <SectionHead
              eyebrow={days.length > 1 ? `Day ${day}` : 'Programme'}
              title={days.length > 1 ? `Day ${day} — ${daySessions.length} sessions` : `${daySessions.length} sessions`}
            />
            <div className="border-t border-line">
              {daySessions.map((s, i) => {
                const n = (day - 1) * PER_DAY + i + 1;
                const isAttended = !!attended[s.id];
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate({ name: 'session', conferenceId, sessionId: s.id })}
                    className="group flex items-start gap-4 w-full text-left py-4 px-1 border-b border-line hover:bg-sunk/50 transition-colors"
                  >
                    <span className="label text-ink-3 nums w-7 shrink-0 pt-1" style={{ fontSize: 10 }}>
                      {String(n).padStart(2, '0')}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[15.5px] font-medium leading-snug text-ink group-hover:text-accent-deep">
                        {s.topic}
                      </span>
                      <span className="flex items-center gap-2.5 flex-wrap mt-1.5 text-[12.5px] text-ink-3">
                        {s.speakerName && <span>{s.speakerName}</span>}
                        {s.speakerTitle && <span className="text-line">·</span>}
                        {s.speakerTitle && <span className="truncate max-w-[32ch]">{s.speakerTitle}</span>}
                        {s.durationMinutes && (
                          <>
                            <span className="text-line">·</span>
                            <span className="inline-flex items-center gap-1 nums"><Clock size={10} /> {s.durationMinutes} min</span>
                          </>
                        )}
                        {isAttended && <span className="label text-good" style={{ fontSize: 9 }}>Attended</span>}
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="text-line group-hover:text-accent shrink-0 mt-1" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>
        ))
      )}
    </Page>
  );
}

/* ============================================================
   SESSION
   ============================================================ */

function QuestionBlock({ q, index, revealed, onReveal }) {
  const question = typeof q === 'string' ? q : (q.q || q.question || '');
  const answer = typeof q === 'string' ? '' : (q.a || q.answer || '');
  return (
    <li className="py-4 border-b border-line-soft last:border-0">
      <div className="flex gap-3">
        <span className="label text-ink-3 nums shrink-0 pt-0.5" style={{ fontSize: 10 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-ink leading-relaxed">{question}</p>
          {answer && (
            revealed ? (
              <div className="rte-content mt-3 pl-3 border-l-2 border-accent" dangerouslySetInnerHTML={{ __html: answer }} />
            ) : (
              <button onClick={onReveal} className="mt-2 text-[12.5px] text-accent-deep hover:underline">
                Show the answer
              </button>
            )
          )}
        </div>
      </div>
    </li>
  );
}

export function SessionView({ conferenceId, sessionId, progress, setProgress, navigate }) {
  const [session, setSession] = useState(null);
  const [conf, setConf] = useState(null);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [s, c, list] = await Promise.all([
        fetchSession(sessionId), fetchConference(conferenceId), fetchSessions(conferenceId),
      ]);
      if (!cancelled) {
        setSession(s); setConf(c); setAll(list); setRevealed({}); setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, conferenceId]);

  if (loading) return <Page><Loading label="Loading session…" /></Page>;
  if (!session || !conf) {
    return (
      <Page>
        <EmptyState
          title="Session not found"
          body="This session is no longer published."
          action={<Button onClick={() => navigate({ name: 'conferences' })}>All conferences</Button>}
        />
      </Page>
    );
  }

  const idx = all.findIndex(s => s.id === sessionId);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  const dayOf = n => Math.floor(n / PER_DAY) + 1;

  const attendedMap = progress?.conferenceProgress?.[conferenceId]?.sessions || {};
  const isAttended = !!attendedMap[sessionId];

  const markAttended = () => {
    if (isAttended) return;
    setProgress(p => {
      const all = p.conferenceProgress || {};
      const mine = all[conferenceId] || { sessions: {} };
      return {
        ...p,
        xp: (p.xp || 0) + 25,
        conferenceProgress: {
          ...all,
          [conferenceId]: {
            ...mine,
            sessions: { ...mine.sessions, [sessionId]: { attendedAt: new Date().toISOString() } },
          },
        },
      };
    });
  };

  const moderatorQs = session.moderatorQs || [];
  const audienceQs = session.audienceQs || [];

  return (
    <Page>
      <Breadcrumb trail={[
        { label: 'Conferences', onClick: () => navigate({ name: 'conferences' }) },
        { label: conf.title, onClick: () => navigate({ name: 'conference', conferenceId }) },
        { label: `Session ${idx + 1}` },
      ]} />

      {/* ---------- Session head ---------- */}
      <header className="pb-7 border-b border-line">
        <div className="flex items-center gap-2.5 flex-wrap mb-3">
          <Eyebrow>
            {all.length > PER_DAY ? `Day ${dayOf(idx)} · Session ${idx + 1}` : `Session ${idx + 1}`} of {all.length}
          </Eyebrow>
          {session.durationMinutes && (
            <Chip tone="quiet"><Clock size={10} /> {session.durationMinutes} min</Chip>
          )}
          {isAttended && <span className="label text-good" style={{ fontSize: 9.5 }}>Attended</span>}
        </div>

        <h1 className="display text-[30px] sm:text-[40px] leading-[1.08] text-ink max-w-[32ch]">{session.topic}</h1>

        {session.speakerName && (
          <div className="flex items-start gap-4 mt-6">
            {session.speakerPhoto ? (
              <img
                src={session.speakerPhoto}
                alt=""
                className="w-14 h-14 rounded-full object-cover border border-line shrink-0"
              />
            ) : (
              <span
                className="w-14 h-14 rounded-full border border-line bg-sunk flex items-center justify-center display text-[20px] text-ink-3 shrink-0"
                aria-hidden="true"
              >
                {(session.speakerName || '?').charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[15px] font-medium text-ink">{session.speakerName}</p>
              {session.speakerTitle && <p className="text-[13.5px] text-ink-2">{session.speakerTitle}</p>}
              {session.speakerAffiliation && <p className="text-[12.5px] text-ink-3">{session.speakerAffiliation}</p>}
              {session.speakerBio && (
                <p className="text-[13px] text-ink-3 leading-relaxed mt-2 max-w-read">{session.speakerBio}</p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ---------- Lecture ---------- */}
      {session.lectureHTML ? (
        <article className="py-9 max-w-read">
          <div className="rte-content" dangerouslySetInnerHTML={{ __html: session.lectureHTML }} />
        </article>
      ) : (
        <div className="py-9">
          <EmptyState title="No lecture written yet" body="This session has a slot in the programme but no written content." />
        </div>
      )}

      {/* ---------- Moderated discussion ---------- */}
      {moderatorQs.length > 0 && (
        <section className="py-9 border-t border-line max-w-read">
          <SectionHead
            eyebrow="From the chair"
            title="Moderated discussion"
            meta="The questions a moderator would put to this speaker. Answers stay hidden until you ask for them."
            action={
              Object.keys(revealed).length < moderatorQs.length ? (
                <Button
                  variant="quiet" size="sm"
                  onClick={() => setRevealed(Object.fromEntries(moderatorQs.map((_, i) => [i, true])))}
                >
                  Reveal all
                </Button>
              ) : null
            }
          />
          <ol className="border-t border-line">
            {moderatorQs.map((q, i) => (
              <QuestionBlock
                key={i} q={q} index={i}
                revealed={!!revealed[i]}
                onReveal={() => setRevealed(r => ({ ...r, [i]: true }))}
              />
            ))}
          </ol>
        </section>
      )}

      {/* ---------- From the floor ---------- */}
      {audienceQs.length > 0 && (
        <section className="py-9 border-t border-line max-w-read">
          <SectionHead
            eyebrow="From the floor"
            title="Questions worth asking"
            meta="What a sharp registrar in the third row would want to know."
          />
          <ul className="border-t border-line">
            {audienceQs.map((q, i) => (
              <QuestionBlock
                key={i} q={q} index={i}
                revealed={!!revealed[`a${i}`]}
                onReveal={() => setRevealed(r => ({ ...r, [`a${i}`]: true }))}
              />
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Footer navigation ---------- */}
      <nav className="flex items-center gap-3 flex-wrap pt-8 mt-2 border-t border-line">
        {prev ? (
          <Button variant="quiet" onClick={() => navigate({ name: 'session', conferenceId, sessionId: prev.id })}>
            <ChevronLeft size={13} /> <span className="truncate max-w-[20ch]">{prev.topic}</span>
          </Button>
        ) : <span />}

        {!isAttended ? (
          <Button onClick={markAttended} className="mx-auto">
            <Check size={13} strokeWidth={3} /> Mark attended
          </Button>
        ) : (
          <span className="mx-auto inline-flex items-center gap-1.5 text-[13px] text-good font-medium">
            <Check size={13} strokeWidth={3} /> Attended
          </span>
        )}

        {next ? (
          <Button variant="quiet" onClick={() => navigate({ name: 'session', conferenceId, sessionId: next.id })}>
            <span className="truncate max-w-[20ch]">{next.topic}</span> <ChevronRight size={13} />
          </Button>
        ) : (
          <Button variant="quiet" onClick={() => navigate({ name: 'conference', conferenceId })}>
            Back to programme <ChevronRight size={13} />
          </Button>
        )}
      </nav>
    </Page>
  );
}
